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
