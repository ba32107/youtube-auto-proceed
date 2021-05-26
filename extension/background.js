browser.runtime.onInstalled.addListener(async details => {
    browser.contextMenus.removeAll();
    browser.contextMenus.create({
        id: "openGitHubPageMenuItem",
        title: "Help / Send Feedback",
        contexts: ["page_action"]
    });
    browser.contextMenus.create({
        id: "versionMenuItem",
        title: "Version " + browser.runtime.getManifest().version,
        contexts: ["page_action"]
    });

    if (details.reason === "update") {
        const extensionInfo = await browser.management.getSelf();
        if (extensionInfo.installType !== "development") {
            await browser.tabs.create({ url: browser.runtime.getURL("updated.html") });
        }
    }
});

browser.contextMenus.onClicked.addListener(async info => {
    let url = "https://github.com/ba32107/youtube-auto-proceed";
    if (info.menuItemId === "versionMenuItem") {
        url += "/releases/tag/v" + browser.runtime.getManifest().version;
    }

    await browser.tabs.create({
        active: true,
        url: url
    });
});

browser.tabs.onActivated.addListener(() => {
    performCheck();
});

browser.tabs.onUpdated.addListener(() => {
    performCheck();
});

browser.runtime.onMessage.addListener(async request => {
    if (request && request.action === "proceed") {
        const currentTab = await getCurrentTabAsync();
        let newUrl = setUrlParameterValue(currentTab.url, "has_verified", "1");
        newUrl = setUrlParameterValue(newUrl, "bpctr", "9999999999");
        await redirectAsync(currentTab, newUrl);
    }
});

function performCheck() {
    setTimeout(async () => {
        const currentTab = await getCurrentTabAsync();
        if (currentTab && currentTab.url && currentTab.url.match(".*:\/\/.*\.youtube\.com\/.*")) {  // eslint-disable-line no-useless-escape
            const maxRetryCount = 5;
            let retryCount = 0;

            while (retryCount <= maxRetryCount) {
                try {
                    await browser.tabs.sendMessage(currentTab.id, { action: "performCheck" });
                    return;
                } catch (ignore) {
                    await sleepAsync(500 + retryCount * 200);
                    retryCount++;
                }
            }
        }
    }, 2000);
}

function setUrlParameterValue(url, urlParamName, newValue) {
    const urlWithoutTheseParams = url.replace(new RegExp(`&${urlParamName}=[^&]+`, "ig"), "");
    return `${urlWithoutTheseParams}&${urlParamName}=${newValue}`;
}

async function redirectAsync(tab, newUrl) {
    await browser.tabs.update(tab.id, { url: newUrl });
}

async function getCurrentTabAsync() {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    return tabs[0];
}

async function sleepAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
