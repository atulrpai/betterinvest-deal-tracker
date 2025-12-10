async function createModal(title, existingData, onSave) {
    if ( document.getElementById("tracker-popup") ) return;

    const url = chrome.runtime.getURL("src/html/tracker.html");
    const response = await fetch(url);
    const htmlContent = await response.text();

    const container = document.createElement("div");
    container.innerHTML = htmlContent;
    document.body.appendChild(container);

    const overlay = document.getElementById("tracker-popup");
    Object.assign(overlay.style, {
        position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.8)", zIndex: "10000", display: "flex", justifyContent: "center", alignItems: "center", color: "black"
    });
    Object.assign(overlay.firstElementChild.style, {
        backgroundColor: "white", padding: "20px", borderRadius: "8px"
    });

    document.getElementById("tracker-title").innerText = title;
    document.getElementById("tracker-project").value = existingData.project || "";
    document.getElementById("tracker-buyer").value = existingData.buyer || "";

    document.getElementById("tracker-cancel").addEventListener("click", () => {
        container.remove();
    });

    document.getElementById("tracker-save").addEventListener("click", () => {
        const newData = {
            project: document.getElementById("tracker-project").value,
            buyer: document.getElementById("tracker-buyer").value
        };
        
        onSave(newData); 
        container.remove();
    });
}

function openTrackerPopup(title, icon, srcUrl) {
    if (!title) return;

    chrome.storage.local.get([title], (result) => {
        const data = result[title] || { project: "", buyer: "" };

        createModal(title, data, (newData) => {            
            chrome.storage.local.set({ [title]: newData }, () => {
                icon.src = srcUrl;
                alert("TRACKER UPDATED FOR " + title);
            });

        });
    });
}

async function loadTrackerData() {
    const infoIconURL = chrome.runtime.getURL("assets/images/info.png");
    const noInfoIconURL = chrome.runtime.getURL("assets/images/no-info.png");

    const buttons = document.querySelectorAll("button.material-icons");

    for (const btn of buttons) {
        if (btn.innerText.trim() !== "keyboard_arrow_right" || !btn.previousElementSibling || btn.parentElement.querySelector(".tracker-injected")) continue;

        const dealName = btn.previousElementSibling.innerText.trim();

        const icon = document.createElement("img");
        icon.src = await new Promise((resolve) => {
            chrome.storage.local.get([dealName], (result) => {
                resolve(result && result.hasOwnProperty(dealName) ? infoIconURL : noInfoIconURL);
            });
        });
        icon.classList.add("tracker-injected");

        const btnStyle = window.getComputedStyle(btn);
        icon.style.width = btnStyle.width;
        icon.style.height = btnStyle.height;
        icon.style.order = parseInt(btnStyle.order) + 1;

        icon.addEventListener("click", (e) => {
            e.stopPropagation();
            openTrackerPopup(dealName, icon, infoIconURL);
        });

        btn.insertAdjacentElement("afterend", icon);
    }

    alert("TRACKER DATA LOADED");
}

function loadAllDeals() {
    function isVisible(el) {
        if (!el) return false;
        const style = window.getComputedStyle(el);
        return (
            el.offsetParent !== null &&
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            style.opacity !== "0"
        );
    }

    function clickUntilGone() {
        const btn = document.querySelector("div.clickable-element.bubble-element.Group.cnwru.bubble-r-container");

        if (!btn || !isVisible(btn)) {
            alert("ALL DEALS LOADED");
            return;
        }

        btn.click();
        setTimeout(clickUntilGone, 1000);
    }

    clickUntilGone();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (window.location.href !== "https://app.betterinvest.club/asset-rbf-movies" && window.location.href !== "https://app.betterinvest.club/asset-rbf-movies/deals") return;

    switch (request.message) {

        case "loadAllDeals":
            loadAllDeals();
            break;

        case "loadTrackerData":
            loadTrackerData();
            break;

    }
});
