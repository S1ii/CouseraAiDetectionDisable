<div align="center">

# 🎓 Coursera AI Instructions Remover

<img src="icons/icon128.svg" alt="Coursera AI Instructions Remover" width="128" height="128">

### Smart Chrome Extension for Clean Learning Experience

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/yourusername/coursera-ai-instructions-remover/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Web%20Store-brightgreen.svg)](https://chrome.google.com/webstore)
[![Manifest V3](https://img.shields.io/badge/manifest-v3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/)

**Automatically removes distracting AI instruction banners from Coursera, giving you a clean, focused learning environment.**

[Features](#-features) • [Installation](#-installation) • [How It Works](#-how-it-works) • [Contributing](#-contributing)

---

</div>

## 🌟 Why This Extension?

Coursera has recently added AI instruction banners throughout their platform. While well-intentioned, these banners can be distracting during focused study sessions. This extension automatically removes them, giving you back the clean interface you love.

### Before & After

```
❌ Before: [AI Instructions Banner] [Your Content] [AI Instructions Banner]
✅ After:  [Your Content]
```

## ✨ Features

### 🚀 Core Functionality
- **🤖 Automatic Removal** - Instantly detects and removes AI instruction elements
- **🔄 Real-time Monitoring** - Uses MutationObserver to catch dynamically loaded content
- **💾 Persistent** - Remembers your settings across sessions
- **🎯 Accurate Detection** - Multi-layered algorithm ensures only AI instructions are removed

### 🎨 User Experience
- **📊 Smart Statistics** - Tracks total removed elements across all sessions
- **🔔 Toast Notifications** - Elegant, non-intrusive alerts
- **🌍 Multilingual** - Full support for Russian and English
- **🌓 Theme Support** - Beautiful dark theme interface
- **⚡ Lightweight** - Minimal memory footprint (< 5 MB)

### 🔧 Technical Excellence
- **🔒 Privacy-First** - No data collection, minimal permissions
- **🔄 Multi-Window Sync** - BroadcastChannel API for instant synchronization
- **📱 Responsive** - Works seamlessly across all Coursera pages
- **⚙️ Configurable** - Easy toggle and settings management

## 📦 Installation

### Option 1: Chrome Web Store (Recommended)

1. Visit the [Chrome Web Store](#) (coming soon)
2. Click "Add to Chrome"
3. Confirm installation
4. Start learning distraction-free! 🎉

### Option 2: Manual Installation (Developer Mode)

1. **Download** this repository:
   ```bash
   git clone https://github.com/yourusername/coursera-ai-instructions-remover.git
   ```

2. **Open Chrome Extensions** page:
   - Navigate to `chrome://extensions/`
   - Or click Menu → More Tools → Extensions

3. **Enable Developer Mode**:
   - Toggle the switch in the top-right corner

4. **Load the Extension**:
   - Click "Load unpacked"
   - Select the extension folder

5. **Verify Installation**:
   - Look for the extension icon in your toolbar
   - Badge should show "ON" status

## 🎯 How It Works

### Detection Methods

The extension uses a sophisticated multi-layered detection system:

```javascript
1. CSS Selectors
   └─ [data-ai-instructions="true"]
   └─ [data-testid="content-integrity-instructions"]
   └─ .css-ow46ga
   └─ [class*="ai-instruction"]

2. Text Content Analysis
   └─ Searches for "AI instruction" keywords
   └─ Validates against false positives

3. MutationObserver
   └─ Monitors DOM changes in real-time
   └─ Triggers on childList and attribute changes

4. Periodic Backup Check
   └─ Runs every 3 seconds
   └─ Catches any missed elements
```

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                 Extension Components                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  📄 background.js (Service Worker)                  │
│  ├─ Settings management                             │
│  ├─ Badge updates                                   │
│  └─ Cross-tab synchronization                       │
│                                                      │
│  📄 content.js (Main Logic)                         │
│  ├─ Element detection & removal                     │
│  ├─ MutationObserver setup                          │
│  ├─ Toast notifications                             │
│  └─ Statistics tracking                             │
│                                                      │
│  📄 popup.html/js (User Interface)                  │
│  ├─ Status display                                  │
│  ├─ Settings control                                │
│  ├─ Language switching                              │
│  └─ Statistics visualization                        │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## 🖥️ Usage

### Basic Controls

**Toggle Extension:**
- Click the extension icon in your toolbar
- Badge shows current status (ON/OFF)

**View Statistics:**
- Click the extension icon
- See total removed elements
- Reset counter if needed

**Change Language:**
- Open popup
- Click language toggle (🇷🇺 / 🇺🇸)
- Interface updates instantly

### Keyboard Shortcuts

Currently no keyboard shortcuts are implemented. Want to add them? [Contribute!](#-contributing)

## 📊 Technical Details

### Performance Metrics

| Metric | Value |
|--------|-------|
| Extension Size | ~150 KB |
| Memory Usage | < 5 MB |
| Load Time | < 100 ms |
| Check Frequency | Every 3 seconds |
| Supported Languages | 2 (Russian, English) |

### Browser Compatibility

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome | 88+ | ✅ Fully Supported |
| Edge | 88+ | ✅ Fully Supported |
| Opera | 74+ | ✅ Fully Supported |
| Firefox | - | ⏳ Planned |
| Safari | - | ⏳ Future |

### Permissions Required

```json
{
  "permissions": [
    "storage",      // Save settings and statistics
    "activeTab"     // Access current tab content
  ],
  "host_permissions": [
    "*://*.coursera.org/*"  // Only works on Coursera
  ]
}
```

**Privacy Notice:** This extension requests minimal permissions and collects NO user data.

## 📁 Project Structure

```
coursera-ai-instructions-remover/
│
├── 📄 manifest.json           # Extension configuration
├── 📄 content.js              # Main removal logic (423 lines)
├── 📄 background.js           # Service worker (246 lines)
├── 📄 popup.html              # Popup interface (427 lines)
├── 📄 popup.js                # Popup logic (357 lines)
├── 📄 popup.css               # Popup styling
├── 📄 locales.js              # Internationalization (87 lines)
│
├── 📁 icons/
│   ├── icon16.svg            # Toolbar icon
│   ├── icon48.svg            # Extension manager
│   └── icon128.svg           # Chrome Web Store
│
├── 📄 README.md              # This file
├── 📄 LICENSE                # MIT License
└── 📄 CHANGELOG.md           # Version history
```

## 🛠️ Configuration

### Available Settings

Access settings through the popup interface:

| Setting | Description | Default |
|---------|-------------|---------|
| **Extension Status** | Enable/disable removal | ON |
| **Remove on Load** | Auto-remove when page loads | ON |
| **Language** | Interface language | Russian |
| **Theme** | Visual theme | Dark |

Settings are automatically synced across all Chrome instances via `chrome.storage.sync`.

## 🐛 Troubleshooting

### Common Issues

**Extension Not Working?**
1. Verify you're on `coursera.org`
2. Check extension is enabled (badge shows "ON")
3. Refresh the page (Ctrl+R / Cmd+R)
4. Check browser console for errors

**Elements Still Appearing?**
1. Clear browser cache
2. Disable/re-enable the extension
3. Update to latest version
4. Report selectors that aren't caught

**Settings Not Saving?**
1. Check `chrome.storage` permissions
2. Verify Chrome sync is enabled
3. Try clearing extension data

### Getting Help

- 📧 [Open an Issue](https://github.com/yourusername/coursera-ai-instructions-remover/issues)
- 💬 Check [Discussions](https://github.com/yourusername/coursera-ai-instructions-remover/discussions)
- 📖 Read [Wiki](https://github.com/yourusername/coursera-ai-instructions-remover/wiki)

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Found an issue? Let us know!
- 💡 **Suggest Features** - Have an idea? Share it!
- 🌍 **Add Translations** - Help make this extension multilingual
- 📝 **Improve Documentation** - Make it easier for others
- 💻 **Submit Code** - Fix bugs or add features

### Development Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/yourusername/coursera-ai-instructions-remover.git
   cd coursera-ai-instructions-remover
   ```

2. **Load in Chrome**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select project directory

3. **Make Changes**
   - Edit files
   - Reload extension in Chrome
   - Test on Coursera

4. **Submit PR**
   ```bash
   git checkout -b feature/amazing-feature
   git commit -m "Add amazing feature"
   git push origin feature/amazing-feature
   ```

### Code Style

- Use clear, descriptive variable names
- Add comments for complex logic
- Follow existing code patterns
- Keep functions small and focused
- Test thoroughly before submitting

## 📝 Changelog

### v2.0.0 (Current) - 2024-11-03

#### ✨ New Features
- Modern popup interface with dark theme
- Smart statistics tracking
- Toast notification system
- Multi-window synchronization
- Russian and English localization
- Theme switching capability

#### 🔧 Improvements
- Enhanced detection algorithm
- Better performance with MutationObserver
- Reduced memory footprint
- Improved error handling

#### 🐛 Bug Fixes
- Fixed storage sync issues
- Resolved race conditions
- Corrected badge update logic

### v1.0.0 - 2024-10-15

- Initial release
- Basic AI instruction removal
- Simple on/off toggle
- Minimal popup interface

[View Full Changelog](CHANGELOG.md)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Coursera AI Instructions Remover

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

## 🙏 Acknowledgments

- Built with ❤️ for the Coursera learning community
- Inspired by the need for distraction-free learning
- Thanks to all contributors and users!

## 📞 Support & Contact

- 🌟 **Star this repo** if you find it useful!
- 🐛 **Report issues** on [GitHub Issues](https://github.com/yourusername/coursera-ai-instructions-remover/issues)
- 💬 **Join discussions** in [GitHub Discussions](https://github.com/yourusername/coursera-ai-instructions-remover/discussions)
- 📧 **Email**: your.email@example.com

## 🗺️ Roadmap

### Planned Features

- [ ] Firefox support
- [ ] Safari support
- [ ] Custom selectors configuration
- [ ] Export/import settings
- [ ] Advanced filtering options
- [ ] Keyboard shortcuts
- [ ] More language options
- [ ] Light theme
- [ ] Statistics export

### In Progress

- [x] Dark theme implementation
- [x] Multi-language support
- [x] Statistics tracking

Want to help with any of these? [Contribute!](#-contributing)

---

<div align="center">

### ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/coursera-ai-instructions-remover&type=Date)](https://star-history.com/#yourusername/coursera-ai-instructions-remover&Date)

---

**Made with 💙 for better learning**

[⬆ Back to Top](#-coursera-ai-instructions-remover)

---

**⚠️ Disclaimer:** This extension is not affiliated with, endorsed by, or connected to Coursera. It's an independent tool created to enhance user experience.

</div>