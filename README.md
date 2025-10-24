# OVH DNS Manager

A modern, multi-account DNS manager for OVH with automatic IP updates. Built with Next.js, React, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![React](https://img.shields.io/badge/React-19-blue)

## ✨ Features

- 🌐 **Multi-Account Support**: Manage DNS records across multiple OVH accounts
- 🔄 **Bulk Updates**: Update multiple DNS records simultaneously (IPv4/IPv6)
- 📊 **Real-time Monitoring**: Track your public IP addresses from multiple providers
- 🤖 **Automatic Updates**: Automatically update DNS records when your IP changes
- 🎨 **Modern UI**: Beautiful, responsive interface built with Tailwind CSS
- ⚡ **Fast**: Built with Next.js for optimal performance
- 🔒 **Secure**: Local configuration storage, credentials never leave your server

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OVH API credentials ([Get them here](https://eu.api.ovh.com/createToken/))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ovh-dns
```

2. Install dependencies:
```bash
npm install
```

3. Create your configuration file:
```bash
cp config.example.json config.json
```

4. Edit \`config.json\` with your OVH API credentials:
```json
{
  "ovhAccounts": [
    {
      "id": "account1",
      "name": "My Account",
      "appKey": "YOUR_APP_KEY",
      "appSecret": "YOUR_APP_SECRET",
      "consumerKey": "YOUR_CONSUMER_KEY",
      "endpoint": "ovh-eu",
      "domains": ["example.com"]
    }
  ]
}
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage

### Managing DNS Records

1. **Select a Domain**: Choose a domain from the dropdown
2. **View Records**: See all DNS records for the selected domain
3. **Add Record**: Click "Add Record" to create a new DNS entry
4. **Edit Record**: Click the edit icon on any record to modify it
5. **Delete Record**: Click the trash icon to remove a record
6. **Bulk Update**: Select multiple records and update their IPs in one action

### Bulk IP Updates

1. Select multiple records using checkboxes
2. Click "Update X selected record(s)"
3. Choose record type (A for IPv4 or AAAA for IPv6)
4. Enter the new IP address
5. Click "Update" to apply changes

### Automatic IP Updates

1. Go to Settings
2. Enable IP providers (e.g., ipify.org, icanhazip.com)
3. Configure automatic updates:
   - Enable automatic updates
   - Set check interval (in seconds)
   - Specify target domains
4. The system will periodically check your public IP and update DNS records

### Multi-Account Configuration

Add multiple OVH accounts in Settings to manage DNS across different accounts:

1. Click "Add Account"
2. Enter account details (App Key, App Secret, Consumer Key)
3. Select the OVH endpoint (EU, CA, US)
4. Add domains associated with this account

## 🔧 Configuration

### OVH API Credentials

You need to create an OVH API application:

1. Go to https://eu.api.ovh.com/createToken/
2. Fill in the application details
3. Grant the following permissions:
   - GET /domain/zone/*
   - POST /domain/zone/*
   - PUT /domain/zone/*
   - DELETE /domain/zone/*
4. Save your credentials in \`config.json\`

### IP Providers

The application supports multiple IP providers for fetching your public IP:

- **ipify.org** (default)
- **icanhazip.com**
- Custom providers (add your own URLs)

You can enable/disable providers and configure custom endpoints in Settings.

## 🛠️ Technology Stack

- **Framework**: Next.js 16.0
- **UI Library**: React 19
- **Styling**: Tailwind CSS 3.4
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API
- **OVH API**: ovh package

## 📁 Project Structure

```
ovh-dns/
├── app/
│   ├── api/          # API routes
│   ├── layout.tsx    # Root layout
│   ├── page.tsx      # Main page
│   └── globals.css   # Global styles
├── components/
│   ├── DNSManager.js # DNS management interface
│   └── Settings.js   # Settings interface
├── lib/
│   ├── ovh-service.js        # OVH API service
│   └── ip-monitor-service.js # IP monitoring service
├── public/           # Static assets
├── config.json       # Configuration (not in git)
└── config.example.json # Configuration template
```

## 🐛 Troubleshooting

### DNS Records Not Loading

- Check your OVH API credentials
- Verify the domain exists in your OVH account
- Check the browser console for errors

### IP Detection Not Working

- Ensure at least one IP provider is enabled
- Check your internet connection
- Try a different IP provider

### Configuration Not Saving

- Verify file permissions for \`config.json\`
- Check server logs for errors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OVH for their excellent API
- Next.js team for the amazing framework
- All contributors and users of this project

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

Made with ❤️ for the DNS management community
