# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-24

### Added

- Initial release of OVH DNS Manager
- Multi-account OVH support
- DNS record management (A, AAAA, CNAME, MX, TXT, NS, SRV)
- Bulk update functionality for IPv4 and IPv6 records
- Real-time IP detection from multiple providers
- Automatic DNS updates when IP changes
- Modern responsive UI with Tailwind CSS
- Domain selection and filtering
- Record search and filtering by type
- Configuration management through Settings page
- IP provider configuration (ipify.org, icanhazip.com)
- Automatic update scheduling
- Local JSON configuration storage
- Next.js 16.0 with App Router
- React 19 components
- RESTful API routes
- Comprehensive documentation (README, QUICKSTART, DEPLOYMENT)

### Features

#### DNS Management
- View all DNS records for selected domain
- Add new DNS records with custom TTL
- Edit existing DNS records
- Delete DNS records with confirmation
- Filter records by type (A, AAAA, CNAME, etc.)
- Search records by subdomain or value
- Bulk selection and update

#### Multi-Account Support
- Manage multiple OVH accounts from single interface
- Configure different API credentials per account
- Support for multiple OVH endpoints (EU, CA, US)
- Domain assignment per account

#### IP Monitoring
- Multiple IP provider support
- Real-time IPv4 and IPv6 detection
- Enable/disable providers individually
- Custom provider URL configuration

#### Automatic Updates
- Scheduled IP checking
- Automatic DNS record updates
- Configurable check intervals
- Target domain filtering
- Enable/disable per domain

#### User Interface
- Modern, clean design
- Responsive layout for all devices
- Dark mode support via Tailwind
- Intuitive navigation
- Real-time feedback and notifications
- Loading states and error handling

### Technical Details

#### Stack
- Next.js 16.0.0 with Turbopack
- React 19.0.0
- Tailwind CSS 3.4.1
- Lucide React for icons
- OVH Node.js SDK

#### API Routes
- `/api/config` - Configuration management
- `/api/domains` - Domain listing
- `/api/domains/[domain]/records` - Record management
- `/api/domains/[domain]/bulk-update` - Bulk updates
- `/api/dns/refresh` - Zone refresh
- `/api/ip/current` - Current IP detection

#### Components
- `DNSManager` - Main DNS management interface
- `Settings` - Configuration management
- Modular, reusable React components

#### Services
- `ovh-service.js` - OVH API integration
- `ip-monitor-service.js` - IP monitoring and updates

### Documentation

- Comprehensive README with features and usage
- Quick start guide for rapid deployment
- Deployment guide with multiple options
- Example configuration file
- MIT License

### Security

- Local configuration storage
- No credential transmission to external services
- File-based configuration management
- API route protection

---

## Future Releases

### [1.1.0] - Planned

#### Proposed Features
- DNS record templates
- Backup and restore functionality
- Export/import DNS records
- Record history and audit log
- Email notifications for IP changes
- Webhook support for integrations
- Dashboard with statistics
- Multi-language support
- Dark/light theme toggle

#### Technical Improvements
- Database support (optional)
- Docker image publication
- Automated tests
- CI/CD pipeline
- Performance optimizations
- Enhanced error handling

---

For more information, see the [README](README.md).
