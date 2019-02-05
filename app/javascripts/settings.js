chrome.storage.sync.get(['autoDownload'], function (setting) {
    document.getElementById('checkboxAutoDownload').checked = setting.autoDownload;
});

document.getElementById('checkboxAutoDownload').addEventListener('change', function (e) {
    chrome.storage.sync.set({autoDownload: e.target.checked})
});
