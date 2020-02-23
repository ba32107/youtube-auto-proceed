
chrome.runtime.onInstalled.addListener(function () {
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
    title: "Get Help / Send Feedback",
    contexts: ["page_action"]
  });
});

chrome.contextMenus.onClicked.addListener(function () {
  chrome.tabs.create({
    active: true,
    url: "https://github.com/ba32107/youtube-auto-proceed"
  });
});

chrome.tabs.onActivated.addListener(function (activeInfo) {
  setTimeout(function () {
    getCurrentTab(function (currentTab) {
      if (currentTab && currentTab.url && currentTab.url.match(".*:\/\/.*\.youtube\.com\/.*")) {
        chrome.tabs.sendMessage(currentTab.id, { action: "performCheck" });
      }
    });
  }, 1000);
});

chrome.runtime.onMessage.addListener(function (request) {
  if (request && request.action === "proceed") {
    getCurrentTab(function (currentTab) {
      let newUrl = getVerifiedUrl(currentTab.url);
      redirect(currentTab, newUrl);
    });
  }
});

function getVerifiedUrl(currentUrl) {
  const verifiedParam = "&has_verified=";
  let indexOfVerifiedParam = currentUrl.indexOf(verifiedParam);

  if (indexOfVerifiedParam > 0) {
    let urlWithoutVerifiedParam = currentUrl.substring(0, indexOfVerifiedParam);
    var remainingUrl = currentUrl.substring(indexOfVerifiedParam + verifiedParam.length);

    let indexOfNextParam = remainingUrl.indexOf("&");
    var valueOfVerifiedParam;

    if (indexOfNextParam > 0) {
      valueOfVerifiedParam = remainingUrl.substring(0, indexOfNextParam);
      remainingUrl = remainingUrl.substring(indexOfNextParam);
    } else {
      valueOfVerifiedParam = remainingUrl;
      remainingUrl = "";
    }

    if (valueOfVerifiedParam === 1) {
      return currentUrl;
    }

    return urlWithoutVerifiedParam + verifiedParam + "1" + remainingUrl;
  }

  return currentUrl + verifiedParam + "1";
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
