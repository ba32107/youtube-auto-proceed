
if (hasInappropriateCheck()) {
    chrome.runtime.sendMessage({ action: "proceed" });
}

function hasInappropriateCheck() {
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
