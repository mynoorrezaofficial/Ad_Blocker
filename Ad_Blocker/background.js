const RULE_IDS = [1, 2, 3, 4, 5];
const DEFAULT_RULES = [
  {
    id: 1,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||doubleclick.net^',
      resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object']
    }
  },
  {
    id: 2,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||googlesyndication.com^',
      resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object']
    }
  },
  {
    id: 3,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||adservice.google.com^',
      resourceTypes: ['script', 'xmlhttprequest', 'sub_frame', 'object']
    }
  },
  {
    id: 4,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||pagead2.googlesyndication.com^',
      resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object']
    }
  },
  {
    id: 5,
    priority: 1,
    action: { type: 'block' },
    condition: {
      urlFilter: '||adroll.com^',
      resourceTypes: ['image', 'script', 'xmlhttprequest', 'sub_frame', 'object']
    }
  }
];

function applyRules(enabled) {
  if (!enabled) {
    chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: RULE_IDS }, () => {
      console.log('Ad blocker disabled, rules removed.');
    });
    return;
  }

  chrome.declarativeNetRequest.updateDynamicRules(
    { addRules: DEFAULT_RULES, removeRuleIds: RULE_IDS },
    () => {
      console.log('Ad blocker enabled, rules applied.');
    }
  );
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ enabled: true }, () => {
    applyRules(true);
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.enabled) {
    return;
  }
  applyRules(changes.enabled.newValue);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'getEnabledState') {
    chrome.storage.local.get({ enabled: true }, (result) => {
      sendResponse({ enabled: result.enabled });
    });
    return true;
  }
});

chrome.declarativeNetRequest.getDynamicRules((rules) => {
  if (rules.length === 0) {
    chrome.storage.local.get({ enabled: true }, (result) => {
      if (result.enabled) {
        applyRules(true);
      }
    });
  }
});
