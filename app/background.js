chrome.runtime.onMessage.addListener(function (arg, sender) {
    switch (arg.message) {
        case 'download':
            if (arg.hasOwnProperty('parameters')) {
                downloadProcess(arg, sender)
            }
            break;
        case 'settings':

            break;
    }
});

