var hasRun = false;

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
	    hasRun = false;
            return;
        }

        btn.click();
        setTimeout(clickUntilGone, 1000);
    }

    clickUntilGone();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === "loadAllDeals" && window.location.href === "https://app.betterinvest.club/asset-rbf-movies" && !hasRun) {
	hasRun = true;
        loadAllDeals();
    }
});