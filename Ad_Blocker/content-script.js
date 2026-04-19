const AD_SELECTORS = [
  // ID and class patterns
  '[id*="ad" i]',
  '[class*="ad" i]',
  '[class*="advert" i]',
  '[class*="sponsor" i]',
  '[class*="banner" i]',
  
  // Attribute patterns
  '[data-ad*]',
  '[data-adzone*]',
  '[data-advertisement*]',
  '[href*="adclick" i]',
  '[src*="ads" i]',
  '[src*="adservice" i]',
  '[src*="doubleclick" i]',
  '[src*="pagead" i]',
  '[src*="googleadservices" i]',
  
  // Common ad containers
  '.google-ad-container',
  '.ad-banner',
  '.ad-slot',
  '.adsbygoogle',
  '.ad-container',
  '.advertisement',
  '.advertise',
  '.ads-container',
  '.ad-wrapper',
  '.ad-region',
  '.ad-frame',
  '.sponsored',
  '.promotion',
  '.promo-box',
  '.sidebar-ads',
  '.top-ads',
  '.bottom-ads',
  
  // iframe patterns
  'iframe[src*="ads" i]',
  'iframe[src*="doubleclick" i]',
  'iframe[src*="pagead" i]',
  'iframe[class*="ad" i]',
  'iframe[id*="ad" i]'
];

function hideAds() {
  chrome.storage.local.get({ enabled: true }, (result) => {
    if (!result.enabled) {
      return;
    }

    const selector = AD_SELECTORS.join(',');
    const nodes = document.querySelectorAll(selector);
    let hidden = 0;
    
    nodes.forEach((node) => {
      node.style.display = 'none !important';
      node.style.visibility = 'hidden !important';
      node.style.pointerEvents = 'none !important';
      hidden++;
    });
    
    if (hidden > 0) {
      console.log(`[Ad Blocker] Hidden ${hidden} ad elements`);
    }
  });
}

// Run on page load
hideAds();

// Watch for dynamically added ads
const observer = new MutationObserver(() => {
  hideAds();
});

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'id', 'src', 'data-ad']
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled) {
    hideAds();
  }
});
