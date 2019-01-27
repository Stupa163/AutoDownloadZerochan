let links = document.getElementsByTagName('a');
let images = [];
const EXTENSION_REGEX = /full.*\.(jpg|jpeg|png)$/;
const TIMER_NEXT_PAGE = 45000;

for (let link in links) {
    if (EXTENSION_REGEX.test(links[link].href)) {
        images.push(links[link].href)
    }
}
chrome.runtime.sendMessage({message: "download", "parameters": images});
setTimeout(function () {
    let paginationButtons = document.getElementsByClassName("pagination")[0].getElementsByTagName("a");
    for (let i in paginationButtons) {
        (paginationButtons[i].text === "Suivante »") ? window.location.replace(paginationButtons[i].href) : null;
    }
}, TIMER_NEXT_PAGE);