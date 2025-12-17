document.addEventListener('DOMContentLoaded', function () {

    function sendMessageAndClose(message, buttonId) {

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { message });
        });

        window.close();

    }

    document.getElementById("loadAllDeals").addEventListener("click", () => {
        sendMessageAndClose("loadAllDeals", "loadAllDeals");
    });

    document.getElementById("loadTrackerData").addEventListener("click", () => {
        sendMessageAndClose("loadTrackerData", "loadTrackerData");
    });

    document.getElementById("editDataBase").addEventListener("click", () => {
        sendMessageAndClose("editDataBase", "editDataBase");
    });

});