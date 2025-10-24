import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const configPath = join(process.cwd(), 'config.json');

export class IPMonitorService {
    constructor() {
        this.loadConfig();
    }

    loadConfig() {
        try {
            this.config = JSON.parse(readFileSync(configPath, 'utf8'));
        } catch (error) {
            console.error('Error loading config:', error);
            this.config = { ipProviders: [], currentIPs: {} };
        }
    }

    async fetchIPFromProvider(provider, type = 'ipv4') {
        const url = type === 'ipv4' ? provider.ipv4Url : provider.ipv6Url;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (compatible; OVH-DNS-Manager/1.0)'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            const ip = text.trim();
            
            // Basic validation
            if (type === 'ipv4') {
                const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
                if (!ipv4Regex.test(ip)) {
                    throw new Error('Invalid IPv4 format');
                }
            } else if (type === 'ipv6') {
                const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
                if (!ipv6Regex.test(ip)) {
                    throw new Error('Invalid IPv6 format');
                }
            }
            
            return ip;
        } catch (error) {
            console.error(`Error fetching ${type} from ${provider.name}:`, error);
            throw error;
        }
    }

    async getCurrentIPs() {
        const enabledProviders = this.config.ipProviders?.filter(p => p.enabled) || [];
        
        if (enabledProviders.length === 0) {
            throw new Error('No IP providers enabled');
        }

        let ipv4 = null;
        let ipv6 = null;
        
        // Try each provider until we get valid IPs
        for (const provider of enabledProviders) {
            if (!ipv4) {
                try {
                    ipv4 = await this.fetchIPFromProvider(provider, 'ipv4');
                } catch {
                    console.error(`Failed to get IPv4 from ${provider.name}`);
                }
            }
            
            if (!ipv6) {
                try {
                    ipv6 = await this.fetchIPFromProvider(provider, 'ipv6');
                } catch {
                    console.error(`Failed to get IPv6 from ${provider.name}`);
                }
            }
            
            if (ipv4 && ipv6) break;
        }

        // Update config with new IPs
        if (ipv4 || ipv6) {
            this.updateCurrentIPs({ ipv4, ipv6 });
        }

        return { ipv4, ipv6 };
    }

    updateCurrentIPs(ips) {
        try {
            this.config.currentIPs = {
                ...this.config.currentIPs,
                ...ips,
                lastUpdate: new Date().toISOString()
            };
            
            writeFileSync(configPath, JSON.stringify(this.config, null, 2), 'utf8');
        } catch (error) {
            console.error('Error updating current IPs in config:', error);
        }
    }

    getStoredIPs() {
        return this.config.currentIPs || { ipv4: null, ipv6: null, lastUpdate: null };
    }

    async checkAndUpdateIPs() {
        try {
            const newIPs = await this.getCurrentIPs();
            const storedIPs = this.getStoredIPs();
            
            const changed = {
                ipv4: newIPs.ipv4 && newIPs.ipv4 !== storedIPs.ipv4,
                ipv6: newIPs.ipv6 && newIPs.ipv6 !== storedIPs.ipv6
            };
            
            return {
                changed: changed.ipv4 || changed.ipv6,
                newIPs,
                oldIPs: storedIPs,
                details: changed
            };
        } catch (error) {
            console.error('Error checking IPs:', error);
            throw error;
        }
    }
}

const ipMonitorServiceInstance = new IPMonitorService();
export default ipMonitorServiceInstance;
