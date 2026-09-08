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
let youtubeAdWatchStarted = false;
let youtubeAdCounted = false;
let youtubeObserver = null;
let pageObserverStarted = false;

const YOUTUBE_SKIP_SELECTORS = [
  '.ytp-ad-skip-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-skip-ad-button'
];

const YOUTUBE_HIDE_SELECTORS = [
  '.ytp-ad-module',
  '.ytp-ad-image-overlay',
  '.ytp-ad-player-overlay',
  '.ytp-ad-overlay-container',
  '.ytp-ad-preview-text',
  '.ytp-ad-text-overlay',
  '.ytp-ad-feedback-dialog',
  '.ytp-ad-survey',
  '.ytp-ad-progress-list',
  '.ytp-ad-button',
  '.ytp-ad-skip-button',
  '.ytp-ad-skip-button-modern',
  '.ytp-skip-ad-button'
];

function isWhitelisted(url, whitelist) {
  try {
    const hostname = new URL(url).hostname;
    return whitelist.some(domain => hostname.includes(domain));
  } catch (e) { return false; }
}

function injectYouTubeStyles() {
  if (document.getElementById('adblocker-youtube-style')) return;

  const style = document.createElement('style');
  style.id = 'adblocker-youtube-style';
  style.textContent = `${YOUTUBE_HIDE_SELECTORS.join(',')} { display: none !important; visibility: hidden !important; opacity: 0 !important; pointer-events: none !important; }`;
  document.documentElement.appendChild(style);
}

function hideYouTubeNodes(root = document) {
  YOUTUBE_HIDE_SELECTORS.forEach((selector) => {
    root.querySelectorAll(selector).forEach((node) => {
      node.style.setProperty('display', 'none', 'important');
      node.style.setProperty('visibility', 'hidden', 'important');
      node.style.setProperty('opacity', '0', 'important');
      node.style.setProperty('pointer-events', 'none', 'important');
    });
  });
}

function handleYouTubeAds() {
  if (!window.location.hostname.includes('youtube.com')) return;

  injectYouTubeStyles();

  const video = document.querySelector('video');
  const ad = document.querySelector('.ad-showing, .ad-interrupting, .ytp-ad-player-overlay');
  const skipButton = document.querySelector(YOUTUBE_SKIP_SELECTORS.join(','));

  if (!ad || !video) {
    youtubeAdCounted = false;
    return;
  }

  if (skipButton) {
    skipButton.style.display = 'none';
    skipButton.setAttribute('aria-hidden', 'true');
    skipButton.click();
  } else {
    // Modern YouTube ad skipping: speed up, mute, and jump to end
    if (video.duration > 0 && !isNaN(video.duration)) {
      video.playbackRate = 16.0;
      video.muted = true;
      video.currentTime = Math.max(video.currentTime, video.duration - 0.1);
      video.play().catch(() => {});
    }
  }

  if (!youtubeAdCounted) {
    blockedOnPage++;
    youtubeAdCounted = true;
  }
  
  // Also remove common overlay ads that appear on videos
  const overlays = document.querySelectorAll('.ytp-ad-overlay-container, .ytp-ad-image-overlay');
  overlays.forEach(overlay => {
    if (overlay.style.display !== 'none') {
      overlay.style.display = 'none';
      blockedOnPage++;
    }
  });

  hideYouTubeNodes();
}

function startYouTubeAdWatch() {
  if (youtubeAdWatchStarted || !window.location.hostname.includes('youtube.com')) return;
  youtubeAdWatchStarted = true;

  const runIfActive = () => {
    chrome.storage.local.get({ enabled: true, whitelist: [] }, (result) => {
      if (!result.enabled || isWhitelisted(window.location.href, result.whitelist)) {
        youtubeAdCounted = false;
        return;
      }

      handleYouTubeAds();
    });
  };

  runIfActive();

  youtubeObserver = new MutationObserver(runIfActive);
  youtubeObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'style']
  });

  window.addEventListener('yt-navigate-finish', runIfActive, true);
  window.addEventListener('load', runIfActive, true);
}

function startPageObserver() {
  if (pageObserverStarted) return;
  if (!document.documentElement) {
    return;
  }

  pageObserverStarted = true;
  const observer = new MutationObserver(hideElements);
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'id', 'src']
  });
}

function boot() {
  hideElements();
  startYouTubeAdWatch();
  startPageObserver();
}

function waitForDocumentRoot() {
  if (document.documentElement) {
    boot();
    return;
  }

  setTimeout(waitForDocumentRoot, 0);
}

if (document.documentElement) {
  boot();
} else {
  waitForDocumentRoot();
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
