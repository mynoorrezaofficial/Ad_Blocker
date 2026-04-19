
# Simple Ad Blocker Extension

A lightweight browser extension that blocks ads and hides ad elements on web pages.

## Features

- **Network-level blocking** using `declarativeNetRequest` API
- **DOM-level hiding** using CSS selectors and content scripts
- **Easy toggle** - enable/disable with one click
- **Blocks common ad sources** like Google Ads, DoubleClick, AdRoll, and more
- **Dynamic ad detection** - catches ads loaded after page load via MutationObserver
- **Zero configuration** - works out of the box

## Supported Browsers

- ✅ Chrome
- ✅ Edge
- ⚙️ Firefox (with minor adjustments)

## Installation

### Chrome/Edge

1. Open your browser and navigate to the extensions page:
   - **Chrome**: `chrome://extensions`
   - **Edge**: `edge://extensions`

2. Enable **Developer mode** (toggle in top-right corner)

3. Click **Load unpacked**

4. Select the `Ad_Blocker` folder from this project

5. The extension will appear in your extensions list

### Firefox

1. Navigate to `about:debugging#/runtime/this-firefox`

2. Click **Load Temporary Add-on**

3. Select the `manifest.json` file from this project

## Usage

1. Click the **Ad Blocker** icon in your browser toolbar
2. The popup shows current status (Enabled/Disabled)
3. Click **Turn Off** to disable or **Turn On** to enable
4. Refresh the page to see changes

## How It Works

### 1. Network Blocking
- `background.js` uses the `declarativeNetRequest` API to block requests to known ad domains:
  - `doubleclick.net`
  - `googlesyndication.com`
  - `adservice.google.com`
  - `pagead2.googlesyndication.com`
  - `adroll.com`

### 2. DOM Element Hiding
- `content-script.js` scans the page for elements with ad-related attributes/classes
- Uses 40+ CSS selectors to identify and hide ads
- MutationObserver watches for dynamically added ads

### 3. Storage & Sync
- Extension state (enabled/disabled) is stored in `chrome.storage.local`
- Popup and content script stay synchronized via `chrome.storage.onChanged`

## Project Structure

```
Ad_Blocker/
├── manifest.json          # Extension configuration
├── background.js          # Service worker - network blocking logic
├── content-script.js      # Content script - DOM hiding logic
├── popup.html             # Popup UI
├── popup.js               # Popup logic
├── popup.css              # Popup styles
├── README.md              # This file
└── .gitignore             # Git ignore rules
```

## Debugging

### Enable Console Logging

Open DevTools (`F12`) and go to the Console tab:

1. **Content Script Console**: Shows what ads are being hidden
   - Check the website's DevTools Console

2. **Background Script Console**: Shows extension state changes
   - Go to `chrome://extensions` → Find this extension → Click "Details" → "Service Worker"

### Check What's Being Blocked

1. Open DevTools (`F12`) on any website
2. Look for messages like: `[Ad Blocker] Hidden 5 ad elements`
3. Right-click any ad → **Inspect** to see its CSS class or ID
4. Add new selectors to `AD_SELECTORS` in `content-script.js`

## Adding Custom Ad Selectors

To block more ads:

1. Open `content-script.js`
2. Add new selectors to the `AD_SELECTORS` array
3. Reload the extension in `chrome://extensions`

Example:
```javascript
const AD_SELECTORS = [
  // ... existing selectors ...
  '[class*="custom-ad-class"]',
  '#my-ad-container'
];
```

## Limitations

- **Cannot block all ads** - Some ads are served inline or use dynamic injection
- **May break some layouts** - Removing ad containers can sometimes cause spacing issues
- **No filter lists** - Uses hardcoded domain list (version 1.0)

## Future Improvements

- [ ] Support for EasyList and uBlock filter lists
- [ ] User-definable filter rules
- [ ] Whitelist management
- [ ] Statistics dashboard (ads blocked per session)
- [ ] Performance optimizations
- [ ] Firefox/Safari compatibility

## License

MIT License - Feel free to modify and distribute

## Troubleshooting

### Ads still showing after reload?

1. Check if extension is **Enabled** (click icon and see status)
2. Hard refresh the page: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Check DevTools Console for errors

### Extension not appearing in toolbar?

1. Go to `chrome://extensions`
2. Click the **pin icon** next to the extension to pin it to the toolbar

### Performance issues?

- The MutationObserver may slow down some pages
- Disable the extension on heavy sites and enable selectively

## Contributing

Found an ad that wasn't blocked? 

1. Right-click it → **Inspect**
2. Note its class name or ID
3. Add it to `AD_SELECTORS` and submit
