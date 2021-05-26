browser.runtime.onMessage.addListener(request => {
    if (request && request.action === "performCheck") {
        performCheck();
    }
});

function performCheck() {
    if (hasInappropriateMessage()) {
        browser.runtime.sendMessage({ action: "proceed" });
    }
}

function hasInappropriateMessage() {
    const proceedButtonText = "I understand and wish to proceed";
    const errorRootNode = document.getElementById("error-screen");

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
        const child = parentNode.children[i];

        if (findNodeWithTextRecursively(child, text)) {
            return child;
        }
    }
}

const observer = new MutationObserver(mutations => {
    for (let i = 0; i < mutations.length; i++) {
        const mut = mutations[i];
        if (mut.type === "attributes" && mut.attributeName === "hidden") {
            performCheck();
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

performCheck();
