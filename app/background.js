const ITTERATIONS_LIMIT = 20;

chrome.runtime.onMessage.addListener(function (arg, sender, sendResponse) {

    if (arg.message === 'download' && arg.hasOwnProperty('parameters')) {
        downloading(arg.parameters).then(function (idImages) {
            isDownloadFinished(idImages).then(function (canceled) {
                console.log(canceled);
                chrome.storage.local.get('canceled', function (items) {
                    fillObject(items, formatDate(new Date()), canceled).then(function (objectFilled) {
                        console.log('set');
                        chrome.storage.local.set({'canceled' : objectFilled});
                        console.log(objectFilled);
                    });
                });
            }).catch(function (error) {
                console.log(error);
            })
        }).catch(function (error) {
            console.log(error)
        });
    }
});

function fillObject(object, index, value) {
    object[index] = value;
    return new Promise(function (resolve, reject) {
        let itterations = 0;
        let checkSize = setInterval(function () {
            itterations++;
            if (itterations > ITTERATIONS_LIMIT) {
                reject('Timeout');
                clearInterval(checkSize);
            }
            if (object.hasOwnProperty(index)) {
                setTimeout(function () {
                    resolve(object);
                    clearInterval(checkSize);
                }, 1000);
            }
        }, 750);
    });
}

function formatDate(date) {
    let day = (date.getDate() >= 1 && date.getDate() <= 9) ? '0' + date.getDate() : date.getDate();
    let month = (date.getMonth() >= 0 && date.getMonth() <= 8) ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
    let year = (date.getFullYear() >= 1 && date.getFullYear() <= 9) ? '0' + date.getFullYear() : date.getFullYear();
    let hours = (date.getHours() >= 0 && date.getHours() <= 9) ? '0' + date.getHours() : date.getHours();
    let minutes = (date.getMinutes() >= 0 && date.getMinutes() <= 9) ? '0' + date.getMinutes() : date.getMinutes();
    let seconds = (date.getSeconds() >= 0 && date.getSeconds() <= 9) ? '0' + date.getSeconds() : date.getSeconds();

    return day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds;
}

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