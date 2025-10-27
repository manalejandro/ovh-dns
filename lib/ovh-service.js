import ovh from '@ovhcloud/node-ovh';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), 'config.json');

export class OVHService {
    constructor() {
        this.clients = new Map();
        this.loadConfig();
    }

    loadConfig() {
        try {
            const config = JSON.parse(readFileSync(configPath, 'utf8'));
            this.config = config;
            
            // Initialize OVH clients for each account
            config.ovhAccounts.forEach(account => {
                if (account.appKey && account.appSecret && account.consumerKey) {
                    this.clients.set(account.id, ovh({
                        appKey: account.appKey,
                        appSecret: account.appSecret,
                        consumerKey: account.consumerKey,
                        endpoint: account.endpoint || 'ovh-eu'
                    }));
                }
            });
        } catch (error) {
            console.error('Error loading config:', error);
            this.config = { ovhAccounts: [], ipProviders: [], autoUpdate: { enabled: false }, currentIPs: {} };
        }
    }

    getClientForDomain(domain) {
        // Find which account manages this domain
        for (const account of this.config.ovhAccounts) {
            if (account.domains && account.domains.includes(domain)) {
                return this.clients.get(account.id);
            }
        }
        // Return first available client as fallback
        return this.clients.values().next().value;
    }

    async getAllDomains() {
        const allDomains = [];
        
        for (const [accountId, client] of this.clients.entries()) {
            try {
                const domains = await client.requestPromised('GET', '/domain/zone');
                const account = this.config.ovhAccounts.find(acc => acc.id === accountId);
                
                allDomains.push(...domains.map(domain => ({
                    domain,
                    accountId,
                    accountName: account?.name || accountId
                })));
            } catch (error) {
                console.error(`Error fetching domains from account ${accountId}:`, error);
            }
        }
        
        return allDomains;
    }

    async getDNSRecords(zoneName) {
        try {
            const client = this.getClientForDomain(zoneName);
            if (!client) {
                throw new Error('No OVH client configured for this domain');
            }

            const recordIds = await client.requestPromised('GET', `/domain/zone/${zoneName}/record`);
            
            const records = await Promise.all(
                recordIds.map(async (id) => {
                    const record = await client.requestPromised('GET', `/domain/zone/${zoneName}/record/${id}`);
                    return { ...record, id };
                })
            );
            
            return records;
        } catch (error) {
            console.error(`Failed to fetch DNS records for ${zoneName}:`, error);
            throw error;
        }
    }

    async createDNSRecord(zoneName, recordData) {
        try {
            const client = this.getClientForDomain(zoneName);
            if (!client) {
                throw new Error('No OVH client configured for this domain');
            }

            const record = await client.requestPromised('POST', `/domain/zone/${zoneName}/record`, recordData);
            await this.refreshZone(zoneName);
            
            return record;
        } catch (error) {
            console.error(`Failed to create DNS record in ${zoneName}:`, error);
            throw error;
        }
    }

    async updateDNSRecord(zoneName, recordId, recordData) {
        try {
            const client = this.getClientForDomain(zoneName);
            if (!client) {
                throw new Error('No OVH client configured for this domain');
            }

            const record = await client.requestPromised('PUT', `/domain/zone/${zoneName}/record/${recordId}`, recordData);
            await this.refreshZone(zoneName);
            
            return record;
        } catch (error) {
            console.error(`Failed to update DNS record ${recordId} in ${zoneName}:`, error);
            throw error;
        }
    }

    async deleteDNSRecord(zoneName, recordId) {
        try {
            const client = this.getClientForDomain(zoneName);
            if (!client) {
                throw new Error('No OVH client configured for this domain');
            }

            await client.requestPromised('DELETE', `/domain/zone/${zoneName}/record/${recordId}`);
            await this.refreshZone(zoneName);
        } catch (error) {
            console.error(`Failed to delete DNS record ${recordId} from ${zoneName}:`, error);
            throw error;
        }
    }

    async refreshZone(domain) {
        try {
            const client = this.getClientForDomain(domain);
            if (!client) {
                throw new Error('No OVH client configured for this domain');
            }

            const result = await client.requestPromised('POST', `/domain/zone/${domain}/refresh`);
            return result;
        } catch (error) {
            console.error(`Failed to refresh DNS zone: ${domain}`, error);
            throw error;
        }
    }

    async bulkUpdateRecords(zoneName, recordIds, updateData) {
        const results = [];
        
        for (const recordId of recordIds) {
            try {
                const result = await this.updateDNSRecord(zoneName, recordId, updateData);
                results.push({ recordId, success: true, result });
            } catch (error) {
                results.push({ recordId, success: false, error: error.message });
            }
        }
        
        return results;
    }

    async bulkDeleteRecords(zoneName, recordIds) {
        const results = [];
        
        for (const recordId of recordIds) {
            try {
                await this.deleteDNSRecord(zoneName, recordId);
                results.push({ recordId, success: true });
            } catch (error) {
                results.push({ recordId, success: false, error: error.message });
            }
        }
        
        return results;
    }

    exportToBind9(zoneName, records) {
        const lines = [];
        lines.push(`; Zone file for ${zoneName}`);
        lines.push(`; Generated on ${new Date().toISOString()}`);
        lines.push('');
        lines.push(`$ORIGIN ${zoneName}.`);
        lines.push('');

        // Sort records by type for better readability
        const sortedRecords = [...records].sort((a, b) => {
            const typeOrder = { SOA: 0, NS: 1, A: 2, AAAA: 3, CNAME: 4, MX: 5, TXT: 6, SPF: 7, SRV: 8 };
            return (typeOrder[a.fieldType] || 99) - (typeOrder[b.fieldType] || 99);
        });

        for (const record of sortedRecords) {
            const subdomain = record.subDomain || '@';
            const ttl = record.ttl || 3600;
            
            let line = '';
            
            switch (record.fieldType) {
                case 'A':
                case 'AAAA':
                    line = `${subdomain}\t${ttl}\tIN\t${record.fieldType}\t${record.target}`;
                    break;
                case 'CNAME':
                    line = `${subdomain}\t${ttl}\tIN\tCNAME\t${record.target}${record.target.endsWith('.') ? '' : '.'}`;
                    break;
                case 'MX':
                    const priority = record.priority || 10;
                    line = `${subdomain}\t${ttl}\tIN\tMX\t${priority} ${record.target}${record.target.endsWith('.') ? '' : '.'}`;
                    break;
                case 'TXT':
                    const txtValue = record.target.includes(' ') && !record.target.startsWith('"') 
                        ? `"${record.target}"` 
                        : record.target;
                    line = `${subdomain}\t${ttl}\tIN\tTXT\t${txtValue}`;
                    break;
                case 'SPF':
                    const spfValue = record.target.includes(' ') && !record.target.startsWith('"') 
                        ? `"${record.target}"` 
                        : record.target;
                    line = `${subdomain}\t${ttl}\tIN\tSPF\t${spfValue}`;
                    break;
                case 'SRV':
                    const priority_srv = record.priority || 0;
                    const weight = record.weight || 0;
                    const port = record.port || 0;
                    line = `${subdomain}\t${ttl}\tIN\tSRV\t${priority_srv} ${weight} ${port} ${record.target}${record.target.endsWith('.') ? '' : '.'}`;
                    break;
                case 'NS':
                    line = `${subdomain}\t${ttl}\tIN\tNS\t${record.target}${record.target.endsWith('.') ? '' : '.'}`;
                    break;
                case 'CAA':
                    const flags = record.flags || 0;
                    const tag = record.tag || 'issue';
                    line = `${subdomain}\t${ttl}\tIN\tCAA\t${flags} ${tag} "${record.target}"`;
                    break;
                default:
                    line = `${subdomain}\t${ttl}\tIN\t${record.fieldType}\t${record.target}`;
            }
            
            lines.push(line);
        }
        
        lines.push('');
        return lines.join('\n');
    }

    parseFromBind9(zoneName, zoneContent) {
        const records = [];
        const lines = zoneContent.split('\n');
        
        let currentOrigin = zoneName;
        
        for (let line of lines) {
            // Remove comments
            const commentIndex = line.indexOf(';');
            if (commentIndex !== -1) {
                line = line.substring(0, commentIndex);
            }
            
            line = line.trim();
            
            // Skip empty lines
            if (!line) continue;
            
            // Handle $ORIGIN directive
            if (line.startsWith('$ORIGIN')) {
                const parts = line.split(/\s+/);
                if (parts[1]) {
                    currentOrigin = parts[1].replace(/\.$/, '');
                }
                continue;
            }
            
            // Skip $TTL and other directives for now
            if (line.startsWith('$')) continue;
            
            // Parse record line
            const parts = line.split(/\s+/);
            if (parts.length < 4) continue;
            
            let idx = 0;
            let subdomain = parts[idx++];
            
            // Handle @ symbol
            if (subdomain === '@') {
                subdomain = '';
            }
            
            // Remove trailing dot from subdomain
            if (subdomain.endsWith('.')) {
                subdomain = subdomain.slice(0, -1);
            }
            
            let ttl = 3600;
            let recordClass = 'IN';
            let recordType = '';
            
            // Parse TTL (if it's a number)
            if (!isNaN(parts[idx])) {
                ttl = parseInt(parts[idx++]);
            }
            
            // Parse class (usually IN)
            if (parts[idx] === 'IN' || parts[idx] === 'CH' || parts[idx] === 'HS') {
                recordClass = parts[idx++];
            }
            
            // Parse record type
            recordType = parts[idx++];
            
            // Parse record data based on type
            const recordData = {
                fieldType: recordType,
                subDomain: subdomain,
                ttl: ttl
            };
            
            switch (recordType) {
                case 'A':
                case 'AAAA':
                    recordData.target = parts[idx];
                    break;
                case 'CNAME':
                case 'NS':
                    recordData.target = parts[idx].replace(/\.$/, '');
                    break;
                case 'MX':
                    recordData.priority = parseInt(parts[idx++]);
                    recordData.target = parts[idx].replace(/\.$/, '');
                    break;
                case 'TXT':
                    // Join remaining parts and remove quotes
                    const txtValue = parts.slice(idx).join(' ');
                    recordData.target = txtValue.replace(/^"|"$/g, '');
                    break;
                case 'SPF':
                    // Join remaining parts and remove quotes
                    const spfValue = parts.slice(idx).join(' ');
                    recordData.target = spfValue.replace(/^"|"$/g, '');
                    break;
                case 'SRV':
                    recordData.priority = parseInt(parts[idx++]);
                    recordData.weight = parseInt(parts[idx++]);
                    recordData.port = parseInt(parts[idx++]);
                    recordData.target = parts[idx].replace(/\.$/, '');
                    break;
                case 'CAA':
                    recordData.flags = parseInt(parts[idx++]);
                    recordData.tag = parts[idx++];
                    const caaValue = parts.slice(idx).join(' ');
                    recordData.target = caaValue.replace(/^"|"$/g, '');
                    break;
                default:
                    recordData.target = parts.slice(idx).join(' ');
            }
            
            // Skip SOA records as they are managed by OVH
            if (recordType !== 'SOA') {
                records.push(recordData);
            }
        }
        
        return records;
    }

    async importFromBind9(zoneName, zoneContent, replaceAll = false) {
        const records = this.parseFromBind9(zoneName, zoneContent);
        
        if (replaceAll) {
            // Delete all existing records (except SOA and NS for zone apex)
            const existingRecords = await this.getDNSRecords(zoneName);
            const recordsToDelete = existingRecords.filter(r => 
                r.fieldType !== 'SOA' && 
                !(r.fieldType === 'NS' && (!r.subDomain || r.subDomain === ''))
            );
            
            for (const record of recordsToDelete) {
                try {
                    await this.deleteDNSRecord(zoneName, record.id);
                } catch (error) {
                    console.error(`Failed to delete record ${record.id}:`, error);
                }
            }
        }
        
        // Create all imported records
        const results = [];
        for (const recordData of records) {
            try {
                const result = await this.createDNSRecord(zoneName, recordData);
                results.push({ success: true, record: result });
            } catch (error) {
                results.push({ success: false, error: error.message, record: recordData });
            }
        }
        
        return results;
    }

    getConfig() {
        return this.config;
    }

    saveConfig(newConfig) {
        try {
            writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');
            this.config = newConfig;
            
            // Reinitialize clients
            this.clients.clear();
            newConfig.ovhAccounts.forEach(account => {
                if (account.appKey && account.appSecret && account.consumerKey) {
                    this.clients.set(account.id, ovh({
                        appKey: account.appKey,
                        appSecret: account.appSecret,
                        consumerKey: account.consumerKey,
                        endpoint: account.endpoint || 'ovh-eu'
                    }));
                }
            });
            
            return true;
        } catch (error) {
            console.error('Error saving config:', error);
            throw error;
        }
    }
}

const ovhServiceInstance = new OVHService();
export default ovhServiceInstance;
