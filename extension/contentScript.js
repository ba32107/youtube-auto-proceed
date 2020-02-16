
function checkAndProceedIfInappropriateMessageIsPresent() {
    if (hasInappropriateMessage()) {
        chrome.runtime.sendMessage({ action: "proceed" });
    }
}

function hasInappropriateMessage() {
    const proceedButtonText = "I understand and wish to proceed";
    let errorRootNode = document.getElementById("error-screen");

    return findNodeWithTextRecursively(errorRootNode, proceedButtonText);
}

function findNodeWithTextRecursively(parentNode, text) {
    if (!parentNode) {
        return false;
    }

    if (parentNode.text === text) {
        return parentNode;
    }

    for (let i = 0; i < parentNode.children.length; i++) {
        let child = parentNode.children[i];

        if (findNodeWithTextRecursively(child, text)) {
            return child;
        }
    }
}

const observer = new MutationObserver(function (mutations) {
    for (let i = 0; i < mutations.length; i++) {
        let mut = mutations[i];
        if (mut.type === "attributes" && mut.attributeName === "hidden") {
            checkAndProceedIfInappropriateMessageIsPresent();
        }
    }
});

setTimeout(function () {
    const targetNodes = document.getElementsByTagName("yt-page-navigation-progress");

    for (let i = 0; i < targetNodes.length; i++) {
        observer.observe(targetNodes[i], {
            attributes: true
        });
    }
}, 3000);

checkAndProceedIfInappropriateMessageIsPresent();
