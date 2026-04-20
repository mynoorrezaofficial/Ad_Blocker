const RULE_IDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const DEFAULT_RULES = [
  { id: 1, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||doubleclick.net^', resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object'] } },
  { id: 2, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||googlesyndication.com^', resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object'] } },
  { id: 3, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||adservice.google.com^', resourceTypes: ['script', 'xmlhttprequest', 'sub_frame', 'object'] } },
  { id: 4, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||pagead2.googlesyndication.com^', resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object'] } },
  { id: 5, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||adroll.com^', resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object'] } },
  { id: 6, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||youtube.com/api/stats/ads?', resourceTypes: ['xmlhttprequest'] } },
  { id: 7, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||youtube.com/pagead/', resourceTypes: ['xmlhttprequest', 'sub_frame'] } },
  { id: 8, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||google.com/pagead/', resourceTypes: ['script', 'xmlhttprequest', 'sub_frame'] } },
  { id: 9, priority: 1, action: { type: 'block' }, condition: { urlFilter: '*adformat=', resourceTypes: ['xmlhttprequest'] } },
  { id: 10, priority: 1, action: { type: 'block' }, condition: { urlFilter: '||amazon-adsystem.com^', resourceTypes: ['image', 'script', 'xmlhttprequest'] } }
];

function applyRules(enabled) {
  if (!enabled) {
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: RULE_IDS });
    return;
  }
  chrome.declarativeNetRequest.updateDynamicRules({ addRules: DEFAULT_RULES, removeRuleIds: RULE_IDS });
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true, totalBlocked: 0, whitelist: [] }, () => {
    applyRules(true);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled) {
    applyRules(changes.enabled.newValue);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'incrementStats') {
    chrome.storage.local.get({ totalBlocked: 0 }, (result) => {
      chrome.storage.local.set({ totalBlocked: result.totalBlocked + message.count });
    });
  }
  if (message.type === 'getEnabledState') {
    chrome.storage.local.get({ enabled: true }, (result) => {
      sendResponse({ enabled: result.enabled });
    });
    return true;
  }
});

