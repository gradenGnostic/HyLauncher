# Gaia Launcher - Hytale Launcher

Gaia is a modern, open-source mod manager and community hub for Hytale, built with Electron and React. It provides an intuitive interface for discovering, installing, and managing mods from Orbis.place.

## Features

### Home Tab
- **Welcome Dashboard** - Clean, welcoming interface with beautiful hero banner
- **Featured Mods** - Browse popular mods from the Orbis marketplace
- **Quick Access** - Fast navigation to all features

### Mods Tab
- **Installed Mods Management**
  - View all installed mods
  - Search and filter by name or author
  - Toggle mods on/off
  - Delete mods
  - Filter by enabled/disabled status

- **Orbis Browser & Installer**
  - Browse mods from Orbis.place
  - Search functionality for discovering new mods
  - Click any mod to view detailed information
  - One-click download and installation

### Mod Details Modal
Each mod displays comprehensive information in an interactive modal:
- **Overview Tab** - Mod tagline, license, categories, and status
- **Description Tab** - Full mod description
- **Gallery Tab** - Banner images and visual assets
- **Versions Tab** - Version history and changelog
- **Comments Tab** - Community engagement metrics
- **Download & Install** - Direct installation button

### Settings Tab
- Configure custom mods directory
- Select Hytale executable location
- Manage API keys and preferences

## Technology Stack

- **Framework**: React 18.2.0
- **Desktop**: Electron 28.0.0
- **UI Icons**: Lucide React
- **API**: Orbis.place REST API
- **Build Tools**: React Scripts, Electron Builder

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "hytale mod manager"
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Create distribution package:
```bash
npm run dist
```

## Project Structure

```
src/
├── App.js                 # Main application component
├── App.css               # Application styles
├── components/
│   ├── TopBar.js        # Header with navigation
│   ├── Sidebar.js       # Navigation sidebar
│   ├── LaunchBar.js     # Game launch controls
│   ├── ModCard.js       # Individual mod card component
│   └── tabs/
│       ├── HomeTab.js   # Dashboard and featured mods
│       ├── ModsTab.js   # Mod management and browser
│       └── SettingsTab.js # Configuration
main.js                   # Electron main process
preload.js               # Electron IPC bridge
package.json             # Dependencies and build config
```

## Usage

### Managing Installed Mods
1. Go to **Mods** tab
2. Click **Installed Mods** tab
3. Search mods by name or author
4. Use filter buttons to show All/Enabled/Disabled mods
5. Toggle mods on/off or delete them

### Installing New Mods
1. Go to **Mods** tab
2. Click **Browse & Install** tab
3. Search for mods using the search bar
4. Click any mod card to view details
5. Click **Download & Install** to add the mod

### Configuring Settings
1. Go to **Settings** tab
2. Configure your mods directory
3. Select Hytale executable location
4. Save your preferences

## API Integration

Gaia integrates with **Orbis.place API** to fetch:
- Mod metadata (name, description, author)
- Download counts and statistics
- Version information
- Preview images and banners
- License information
- Community comments

## System Requirements

- Node.js 14+ (for development)
- Windows 7+, macOS 10.13+, or Linux
- At least 100MB free disk space

## Configuration

Gaia stores configuration in a config file that includes:
- Custom mods directory path
- Hytale executable location
- User preferences
- API settings

## Troubleshooting

### Mods not installing
- Verify your mods directory is set in Settings
- Check that the directory exists and is writable
- Ensure you have sufficient disk space

### Orbis mods not loading
- Check your internet connection
- Verify API access to orbis.place
- Try refreshing the mod browser

### Settings not saving
- Ensure the config directory is writable
- Check system permissions

## Contributing

We welcome contributions! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues and feature requests, please open an issue on the repository or visit the Hytale community forums.

## Credits


- Powered by [Orbis.place](https://orbis.place)
- Icons by [Lucide React](https://lucide.dev)

---

**Gaia Launcher v2.0.0** - *The Lunar Client of Hytale*

This will create platform-specific installers in the `dist` folder.

## Usage

1. **First Launch**: The app will attempt to detect your Hytale installation path automatically. If it can't find it, you'll need to set it manually in Settings.

2. **Install a Mod**: 
   - Click the "Install Mod" button
   - Select a `.jar` or `.zip` mod file
   - The mod will be copied to your Hytale mods directory

3. **Enable/Disable Mods**:
   - Click the "Enable" or "Disable" button on any mod card
   - Disabled mods are renamed with a `.disabled` extension

4. **Delete Mods**:
   - Click the trash icon on any mod card
   - Confirm the deletion

5. **Change Settings**:
   - Click the "Settings" button
   - Browse to select a different Hytale installation path

## How It Works

- Disabled mods are renamed with a `.disabled` extension (e.g., `mod.jar.disabled`)
- Enabled mods have their normal filename (e.g., `mod.jar`)
- The app automatically creates the `mods` directory if it doesn't exist


## Technologies

- **Electron**: Desktop application framework
- **React**: UI library
- **CSS3**: Modern styling with gradients and animations

## License

MIT

## Contributing

Feel free to submit issues and enhancement requests!

