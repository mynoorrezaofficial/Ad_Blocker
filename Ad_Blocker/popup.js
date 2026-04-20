const statusEl = document.getElementById('status');
const totalBlockedEl = document.getElementById('total-blocked');
const siteBlockedEl = document.getElementById('site-blocked');
const toggleBtn = document.getElementById('toggle');
const whitelistBtn = document.getElementById('whitelist');

async function updateUi() {
  const data = await chrome.storage.local.get({ enabled: true, totalBlocked: 0, whitelist: [] });
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  const url = tab ? new URL(tab.url) : null;
  const isPaused = url ? data.whitelist.some(d => url.hostname.includes(d)) : false;

  statusEl.textContent = data.enabled ? (isPaused ? 'Paused on this site' : 'Enabled') : 'Disabled';
  statusEl.style.color = data.enabled ? (isPaused ? '#f2994a' : '#27ae60') : '#eb5757';
  
  toggleBtn.textContent = data.enabled ? 'Disable Ad Blocker' : 'Enable Ad Blocker';
  whitelistBtn.textContent = isPaused ? 'Resume on this site' : 'Pause on this site';
  whitelistBtn.style.display = data.enabled ? 'block' : 'none';

  totalBlockedEl.textContent = data.totalBlocked.toLocaleString();

  if (tab && tab.id) {
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'getPageStats' });
      siteBlockedEl.textContent = (response && response.count) || 0;
    } catch (e) {
      siteBlockedEl.textContent = '0';
    }
  }
}


chrome.storage.local.get(null, updateUi);
chrome.storage.onChanged.addListener(updateUi);

toggleBtn.addEventListener('click', async () => {
  const { enabled } = await chrome.storage.local.get({ enabled: true });
  await chrome.storage.local.set({ enabled: !enabled });
});

whitelistBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  
  const hostname = new URL(tab.url).hostname;
  const { whitelist } = await chrome.storage.local.get({ whitelist: [] });
  
  if (whitelist.includes(hostname)) {
    await chrome.storage.local.set({ whitelist: whitelist.filter(d => d !== hostname) });
  } else {
    await chrome.storage.local.set({ whitelist: [...whitelist, hostname] });
  }
  
  chrome.tabs.reload(tab.id);
});

