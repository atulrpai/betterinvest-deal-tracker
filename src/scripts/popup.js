document.addEventListener('DOMContentLoaded', function () {

	document.getElementById("loadAllDeals").addEventListener("click", () => {
		chrome.tabs.query( { active: true, currentWindow: true }, (tabs) => { 
			chrome.tabs.sendMessage( tabs[0].id, {
				message: "loadAllDeals"
			});
		});
	});

});
