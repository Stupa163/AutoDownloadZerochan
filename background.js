const ITTERATIONS_LIMIT = 3;

chrome.runtime.onMessage.addListener(function (arg, sender, sendResponse) {
    if (arg.message === 'download' && arg.hasOwnProperty('parameters')) {

        console.log('setup', arg.parameters.length);

        downloading(arg.parameters).then(function (idImages) {
            //TODO : Check if the download is finished
        }).catch(function (error) {
            console.log(error)
        });
    }
});

function downloading(images) {
    console.log(images);
    return new Promise(function (resolve, reject) {
        let idImages = [];
        images.forEach(function (image, index, array) {
            console.log('downloading ' + (index + 1) + '/' + images.length);
            chrome.downloads.download({url: image, conflictAction: "overwrite"}, async function (downloadId) {
                idImages.push(downloadId);
                if (index === array.length - 1) {
                    waitForArrayToBeFilled(idImages, images.length).then(function () {
                        resolve(idImages);
                    }).catch(function (error) {
                        reject(error);
                    });
                }
            });
        });
    });
}

function waitForArrayToBeFilled(arrayToFill, expectedSize) {
    return new Promise(function (resolve, reject) {
        let itterations = 0;
        let checkSize = setInterval(function () {
            console.log(arrayToFill.length + '/' + expectedSize);
            if (arrayToFill.length !== expectedSize) {
                itterations++;
                if (itterations > ITTERATIONS_LIMIT) {
                    reject('Timeout');
                    clearInterval(checkSize);
                }
                console.log('waiting...');
            } else {
                console.log('resolved');
                resolve();
                clearInterval(checkSize);
            }
        }, 1000);
    });
}


function isDownloadFinished(idImages) {
    console.log('debut verif');

    let check = new Promise(function (resolve, reject) {
        idImages.forEach(function (id, index, array) {
            chrome.downloads.search({id: id}, function (item) {
                console.log(item[0].state);
                if (index === array.length - 1) resolve();
            });
        })
    });


    // let check = new Promise(function (resolve, reject) {
    //     console.log(idImages);
    //     idImages.forEach(function (id, index, array) {
    //         chrome.downloads.search({id: id}, function (item) {
    //             console.log(item[0].state);
    //             if (index === array.length - 1) resolve();
    //         });
    //     })
    // });
    // check.then(function () {
    //     console.log('resolved');
    //     console.log(idImages);
    //     return idImages;
    // })
}