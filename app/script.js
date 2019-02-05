const EXTENSION_REGEX = /full.*\.(jpg|jpeg|png)$/;

chrome.storage.sync.get(['autoDownload'], function (setting) {
    if (setting.autoDownload) {
        loadLinks().then(function (images) {
            chrome.runtime.sendMessage({message: "download", "parameters": images});
        });

        findNextpageButton().then(function (uri) {
            chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
                console.log(request);
                if(request.status === 'finished') {
                    window.location.replace(uri);
                }
            });
        });
    }
});

function findNextpageButton() {
    return new Promise(function (resolve, reject) {
        let paginationButtons = document.getElementsByClassName("pagination")[0].getElementsByTagName("a");
        for (let i in paginationButtons) {
            if (paginationButtons[i].text === "Suivante »") {
                resolve((paginationButtons[i].href));
            }
        }
    })
}

function loadLinks() {
    return new Promise(function (resolve, reject) {
        let images = [];
        let links = document.getElementsByTagName('a');
        for (let link in links) {
            if (EXTENSION_REGEX.test(links[link].href)) {
                images.push(links[link].href)
            }
            if (parseInt(link) === links.length - 1) {
                setTimeout(function () {
                    resolve(images);
                }, 250);
            }
        }
    });
}