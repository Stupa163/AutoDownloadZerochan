const ITTERATIONS_LIMIT = 20;

chrome.runtime.onMessage.addListener(function (arg, sender, sendResponse) {

    // chrome.storage.local.get('canceled', function (items) {
    //     console.log(items.length);
    //     let test = items[items.length + 1] = {canceled: [1, 2, 3, 4, 5]};
    //     console.log(test);
    // });


    if (arg.message === 'download' && arg.hasOwnProperty('parameters')) {
        downloading(arg.parameters).then(function (idImages) {
            isDownloadFinished(idImages).then(function (canceled) {
                console.log(canceled);
                chrome.storage.local.get('canceled', function (items) {
                    //TODO : Enregistrer les valeurs en mémoir à la suite de celles déjà existantes
                    console.log(items);
                });
            }).catch(function (error) {
                console.log(error);
            })

        }).catch(function (error) {
            console.log(error)
        });
    }
});

function isDownloadFinished(idImages) {
    return new Promise(function (resolve, reject) {
        let arrays = {
            idImages: idImages,
            canceled: []
        };
        let checkSize = setInterval(function () {
            console.log(arrays.idImages.length);
            checkCurrentState(idImages, arrays.canceled).then(function (result) {
                arrays = result;
                if (0 === arrays.idImages.length) {
                    console.log('terminé');
                    resolve(arrays.canceled);
                    clearInterval(checkSize)
                } else {
                    console.log('waiting...');
                }
            });
        }, 5000);
    });
}

function checkCurrentState(idImages, canceled) {
    return new Promise(function (resolve, reject) {
        idImages.forEach(function (id, index, array) {
            chrome.downloads.search({id: id}, function (item) {
                switch (item[0].state) {
                    case 'interrupted':
                        (false === canceled.includes(item[0].id)) ? canceled.push(item[0].id) : null;
                        idImages.splice(index, 1);
                        break;
                    case 'complete':
                        idImages.splice(index, 1);
                        break;
                    default:
                        break;
                }
            });
            if (index === array.length - 1) {
                setTimeout(function () {
                    resolve({idImages: idImages, canceled: canceled});
                }, 500)
            }
        });
    })
}

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