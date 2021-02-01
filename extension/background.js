
chrome.runtime.onInstalled.addListener(function (details) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                pageUrl: { hostContains: 'youtube.com' },
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });

    chrome.contextMenus.removeAll();
    chrome.contextMenus.create({
        id: "openGitHubPageMenuItem",
        title: "Help / Send Feedback",
        contexts: ["page_action"]
    });
    chrome.contextMenus.create({
        id: "versionMenuItem",
        title: "Version " + chrome.runtime.getManifest().version,
        contexts: ["page_action"]
    });

    if (details.reason === "update") {
        const updatePageUrl = chrome.runtime.getURL("updated.html");
        chrome.tabs.create({ url: updatePageUrl });
    }
});

chrome.contextMenus.onClicked.addListener(function (info) {
    let url = "https://github.com/ba32107/youtube-auto-proceed";
    if (info.menuItemId === "versionMenuItem") {
        url += "/releases/tag/v" + chrome.runtime.getManifest().version;
    }

    chrome.tabs.create({
        active: true,
        url: url
    });
});

chrome.tabs.onActivated.addListener(function () {
    performCheck();
});

chrome.tabs.onUpdated.addListener(function () {
    performCheck();
});

function performCheck() {
    setTimeout(function () {
        getCurrentTab(function (currentTab) {
            if (currentTab && currentTab.url && currentTab.url.match(".*:\/\/.*\.youtube\.com\/.*")) {
                chrome.tabs.sendMessage(currentTab.id, { action: "performCheck" });
            }
        });
    }, 1000);
}

chrome.runtime.onMessage.addListener(function (request) {
    if (request && request.action === "proceed") {
        getCurrentTab(function (currentTab) {
            let newUrl = setUrlParameterValue(currentTab.url, "has_verified", "1");
            newUrl = setUrlParameterValue(newUrl, "bpctr", "9999999999");
            redirect(currentTab, newUrl);
        });
    }
});

function setUrlParameterValue(url, urlParamName, newValue) {
    const urlWithoutTheseParams = url.replace(new RegExp(`&${urlParamName}=[^&]+`, "ig"), "");
    return `${urlWithoutTheseParams}&${urlParamName}=${newValue}`;
}

function redirect(tab, newUrl) {
    chrome.tabs.update(tab.id, { url: newUrl });
}

function getCurrentTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        let currentTab = tabs[0];
        callback(currentTab);
    });
}
