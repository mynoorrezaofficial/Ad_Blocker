const statusEl = document.getElementById('status');
const toggleBtn = document.getElementById('toggle');

function updateUi(enabled) {
  statusEl.textContent = enabled ? 'Enabled' : 'Disabled';
  toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';
}

chrome.storage.local.get({ enabled: true }, (result) => {
  updateUi(result.enabled);
});

toggleBtn.addEventListener('click', () => {
  chrome.storage.local.get({ enabled: true }, (result) => {
    const nextState = !result.enabled;
    chrome.storage.local.set({ enabled: nextState }, () => {
      updateUi(nextState);
    });
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.enabled) {
    updateUi(changes.enabled.newValue);
  }
});
