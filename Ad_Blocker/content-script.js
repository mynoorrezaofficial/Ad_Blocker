const AD_SELECTORS = [
  '[id*="ad" i]', '[class*="ad" i]', '[class*="advert" i]', '[class*="sponsor" i]', '[class*="banner" i]',
  '[data-ad*]', '[data-adzone*]', '[data-advertisement*]', '[href*="adclick" i]',
  '[src*="ads" i]', '[src*="adservice" i]', '[src*="doubleclick" i]', '[src*="pagead" i]',
  '.google-ad-container', '.ad-banner', '.ad-slot', '.adsbygoogle', '.ad-container',
  '.advertisement', '.advertise', '.ads-container', '.ad-wrapper', '.ad-region',
  '.ad-frame', '.sponsored', '.promotion', '.promo-box', '.sidebar-ads', '.top-ads', '.bottom-ads',
  'iframe[src*="ads" i]', 'iframe[src*="doubleclick" i]', 'iframe[src*="pagead" i]',
  'iframe[class*="ad" i]', 'iframe[id*="ad" i]',
  '.ytp-ad-module', '.ytp-ad-image-overlay', '.ytp-ad-player-overlay',
  'ytd-ad-slot-renderer', 'ytd-display-ad-renderer', 'ytd-promoted-video-renderer',
  'ytd-compact-promoted-item-renderer', 'ytd-video-masthead-ad-v3-renderer',
  'ytd-promoted-sparkles-web-renderer', '.ytd-action-companion-ad-renderer',
  '#player-ads', '#masthead-ad', 'ytd-statement-banner-renderer',
  'ytd-in-feed-ad-layout-renderer', 'ytd-ad-hover-text-button-renderer'
];

const COOKIE_SELECTORS = [
  '[class*="cookie" i]', '[id*="cookie" i]', '.consent-banner', '.gdpr-banner',
  '#didomi-host', '.qc-cmp2-container', '.onetrust-pc-dark-filter', '#onetrust-consent-sdk'
];

const DISTRACTION_SELECTORS = [
  'video[autoplay]:not(#movie_player video)', '.floating-video', '.outstream-video', '[class*="popup" i]:not(body)'
];

let blockedOnPage = 0;

function isWhitelisted(url, whitelist) {
  try {
    const hostname = new URL(url).hostname;
    return whitelist.some(domain => hostname.includes(domain));
  } catch (e) { return false; }
}

function handleYouTubeAds() {
  if (!window.location.hostname.includes('youtube.com')) return;

  const video = document.querySelector('video');
  const ad = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay');
  const skipButton = document.querySelector('.ytp-ad-skip-button, .ytp-ad-skip-button-modern, .ytp-skip-ad-button');

  if (ad && video) {
    if (skipButton) {
      skipButton.click();
      blockedOnPage++;
    } else {
      // Modern YouTube ad skipping: speed up, mute, and jump to end
      if (video.duration > 0 && !isNaN(video.duration)) {
        video.playbackRate = 16.0;
        video.muted = true;
        video.currentTime = video.duration - 0.1;
      }
    }
  }
  
  // Also remove common overlay ads that appear on videos
  const overlays = document.querySelectorAll('.ytp-ad-overlay-container, .ytp-ad-image-overlay');
  overlays.forEach(overlay => {
    if (overlay.style.display !== 'none') {
      overlay.style.display = 'none';
      blockedOnPage++;
    }
  });
}

function hideElements() {
  chrome.storage.local.get({ enabled: true, whitelist: [] }, (result) => {
    if (!result.enabled || isWhitelisted(window.location.href, result.whitelist)) {
      return;
    }

    handleYouTubeAds();

    const allSelectors = [...AD_SELECTORS, ...COOKIE_SELECTORS, ...DISTRACTION_SELECTORS];
    const selector = allSelectors.join(',');
    const nodes = document.querySelectorAll(selector);
    let count = 0;
    
    nodes.forEach((node) => {
      // Check if node is or contains the focused element to avoid aria-hidden warnings
      if (node.contains(document.activeElement)) {
        return; 
      }

      if (node.style.display !== 'none') {
        node.style.display = 'none';
        node.setAttribute('aria-hidden', 'true'); // Consistently hide from assistive tech
        node.setAttribute('tabindex', '-1');     // Remove from tab order
        count++;
      }
    });

    if (count > 0) {
      blockedOnPage += count;
      chrome.runtime.sendMessage({ type: 'incrementStats', count });
    }
  });
}

// Initial run
hideElements();

// Monitor for changes
const observer = new MutationObserver(hideElements);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'id', 'src']
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && (changes.enabled || changes.whitelist)) {
    hideElements();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getPageStats') {
    sendResponse({ count: blockedOnPage });
  }
});