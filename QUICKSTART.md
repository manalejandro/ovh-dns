# Quick Start Guide

Get up and running with OVH DNS Manager in minutes!

## ⚡ 5-Minute Setup

### Step 1: Install

```bash
# Clone the repository
git clone <repository-url>
cd ovh-dns

# Install dependencies
npm install
```

### Step 2: Configure OVH API

1. Go to https://eu.api.ovh.com/createToken/
2. Fill in:
   - **Application name**: OVH DNS Manager
   - **Application description**: DNS Management Tool
   - **Validity**: Unlimited (or your preference)

3. Set permissions (check ALL for each):
   - GET `/domain/zone/*`
   - POST `/domain/zone/*`
   - PUT `/domain/zone/*`
   - DELETE `/domain/zone/*`

4. Click **Create keys** and save your:
   - Application Key
   - Application Secret
   - Consumer Key

### Step 3: Setup Configuration

```bash
# Create config from example
cp config.example.json config.json

# Edit with your credentials
nano config.json  # or use your favorite editor
```

Example configuration:
```json
{
  "ovhAccounts": [
    {
      "id": "account1",
      "name": "My OVH Account",
      "appKey": "YOUR_APP_KEY_HERE",
      "appSecret": "YOUR_APP_SECRET_HERE",
      "consumerKey": "YOUR_CONSUMER_KEY_HERE",
      "endpoint": "ovh-eu",
      "domains": ["example.com"]
    }
  ],
  "ipProviders": [
    {
      "id": "ipify",
      "name": "ipify.org",
      "ipv4Url": "https://api.ipify.org?format=text",
      "ipv6Url": "https://api6.ipify.org?format=text",
      "enabled": true
    }
  ],
  "autoUpdate": {
    "enabled": false,
    "checkInterval": 300,
    "targetDomains": []
  }
}
```

### Step 4: Start the Application

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

### Step 5: Access the Interface

Open your browser and navigate to:
- Development: http://localhost:3000
- Production: http://localhost:3000 (or your configured domain)

## 🎯 First Tasks

### View DNS Records

1. The application will load automatically
2. Select a domain from the dropdown
3. View all DNS records for that domain

### Add a DNS Record

1. Click **"Add Record"** button
2. Select record type (A, AAAA, CNAME, etc.)
3. Enter subdomain (or leave empty for root)
4. Enter target value (IP or domain)
5. Set TTL (default: 3600)
6. Click **"Add"**

### Bulk Update IPs

Perfect for when your public IP changes:

1. Select multiple A or AAAA records (checkboxes)
2. Click **"Update X selected record(s)"**
3. Choose A (IPv4) or AAAA (IPv6)
4. Enter new IP address
5. Click **"Update"**

### Configure Automatic Updates

1. Click **"Settings"** tab
2. Scroll to **"IP Providers"** section
3. Enable at least one provider
4. Scroll to **"Automatic Updates"**
5. Toggle **"Enabled"**
6. Set check interval (e.g., 300 seconds = 5 minutes)
7. Enter target domains (comma-separated)
8. Click **"Save Configuration"**

## 🔧 Common Configurations

### Multiple OVH Accounts

In Settings:
1. Click **"Add Account"**
2. Fill in credentials for each account
3. Assign domains to each account
4. Save configuration

### Custom IP Providers

Edit `config.json`:
```json
{
  "ipProviders": [
    {
      "id": "custom",
      "name": "My Custom Provider",
      "ipv4Url": "https://myservice.com/ip",
      "ipv6Url": "https://myservice.com/ipv6",
      "enabled": true
    }
  ]
}
```

### Different OVH Endpoints

Available endpoints:
- `ovh-eu` - Europe (default)
- `ovh-ca` - Canada
- `ovh-us` - United States

## 🐛 Troubleshooting

### Can't connect to OVH API

✅ Check your credentials in `config.json`
✅ Verify API permissions include domain/zone access
✅ Ensure the consumer key is valid

### Domain not showing

✅ Verify domain is in your OVH account
✅ Check domain is listed in config.json
✅ Try refreshing the domain list

### IP detection not working

✅ Enable at least one IP provider in Settings
✅ Check internet connectivity
✅ Try a different IP provider

## 📚 Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Explore advanced features like scheduled updates
- Configure backup strategies for your config.json

## 💡 Pro Tips

1. **Backup your config**: `cp config.json config.backup.json`
2. **Use descriptive account names**: Makes multi-account management easier
3. **Start with manual updates**: Test before enabling automatic updates
4. **Monitor the first few automatic updates**: Ensure everything works correctly
5. **Keep dependencies updated**: Run `npm update` regularly

## 🆘 Getting Help

- Check the logs in your browser console (F12)
- Review server logs if running in production
- Verify OVH API status at https://status.ovh.com/
- Open an issue on GitHub with detailed information

---

Happy DNS Managing! 🚀
