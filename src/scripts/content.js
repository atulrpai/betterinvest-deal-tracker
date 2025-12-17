function editDataBase() {
    if (document.getElementById("database-popup")) return;

    chrome.storage.local.get(null, (items) => {
        
        const overlay = document.createElement("div");
        overlay.id = "database-popup";
        Object.assign(overlay.style, {
            position: "fixed", top: "0", left: "0", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.8)", zIndex: "10000", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "Arial, sans-serif"
        });

        const contentBox = document.createElement("div");
        Object.assign(contentBox.style, {
            backgroundColor: "white", padding: "20px", borderRadius: "8px", width: "80%", maxHeight: "80%", display: "flex", flexDirection: "column", boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        });

        const header = document.createElement("div");
        Object.assign(header.style, { display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" });
        
        const title = document.createElement("h2");
        title.innerText = "Data Base";
        title.style.margin = "0";

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        Object.assign(closeBtn.style, { padding: "8px 16px", cursor: "pointer", background: "#333", color: "#fff", border: "none", borderRadius: "4px" });
        closeBtn.onclick = () => overlay.remove();

        header.appendChild(title);
        header.appendChild(closeBtn);
        contentBox.appendChild(header);

        const tableContainer = document.createElement("div");
        Object.assign(tableContainer.style, { overflowY: "auto", flexGrow: "1", border: "1px solid #ddd" });

        const table = document.createElement("table");
        Object.assign(table.style, { width: "100%", borderCollapse: "collapse" });

        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr style="background-color: #f2f2f2; text-align: left; position: sticky; top: 0;">
                <th style="padding: 12px; border-bottom: 2px solid #ddd;"></th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Project</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd;">Buyer</th>
                <th style="padding: 12px; border-bottom: 2px solid #ddd; text-align: center; width: 180px;"></th>
            </tr>
        `;
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const keys = Object.keys(items);
        if (keys.length === 0) {
            const tr = document.createElement("tr");
            tr.innerHTML = `<td colspan="4" style="padding: 20px; text-align: center;">No Data</td>`;
            tbody.appendChild(tr);
        } else {
            keys.forEach(key => {
                const data = items[key];
                if (typeof data !== 'object' || data === null) return;

                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid #eee";

                const tdTitle = document.createElement("td");
                tdTitle.style.padding = "10px";
                tdTitle.innerText = key;
                tr.appendChild(tdTitle);

                const tdProject = document.createElement("td");
                tdProject.style.padding = "10px";
                const inputProject = document.createElement("input");
                inputProject.type = "text";
                inputProject.value = data.project || "";
                Object.assign(inputProject.style, { width: "95%", padding: "5px" });
                tdProject.appendChild(inputProject);
                tr.appendChild(tdProject);

                const tdBuyer = document.createElement("td");
                tdBuyer.style.padding = "10px";
                const inputBuyer = document.createElement("input");
                inputBuyer.type = "text";
                inputBuyer.value = data.buyer || "";
                Object.assign(inputBuyer.style, { width: "95%", padding: "5px" });
                tdBuyer.appendChild(inputBuyer);
                tr.appendChild(tdBuyer);

                const tdActions = document.createElement("td");
                Object.assign(tdActions.style, { padding: "10px", textAlign: "center" });

                const btnSave = document.createElement("button");
                btnSave.innerText = "Save";
                Object.assign(btnSave.style, { marginRight: "8px", padding: "6px 12px", backgroundColor: "#4CAF50", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" });
                btnSave.onclick = () => {
                    const newData = {
                        project: inputProject.value,
                        buyer: inputBuyer.value
                    };
                    chrome.storage.local.set({ [key]: newData }, () => {
                        alert("TRACKER UPDATED FOR " + key);
                    });
                };

                const btnDelete = document.createElement("button");
                btnDelete.innerText = "Delete";
                Object.assign(btnDelete.style, { padding: "6px 12px", backgroundColor: "#f44336", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" });
                btnDelete.onclick = () => {
                    if (confirm(`Are you sure you want to delete data for "${key}"?`)) {
                        chrome.storage.local.remove(key, () => {
                            tr.remove();
                            alert("TRACKER DELETED FOR " + key);
                        });
                    }
                };

                tdActions.appendChild(btnSave);
                tdActions.appendChild(btnDelete);
                tr.appendChild(tdActions);

                tbody.appendChild(tr);
            });
        }

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        contentBox.appendChild(tableContainer);
        overlay.appendChild(contentBox);
        document.body.appendChild(overlay);
    });
}

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

        case "editDataBase":
            editDataBase();
            break;
    }
});
