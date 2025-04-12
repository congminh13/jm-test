const textElement = document.getElementById('text')
const optionButtonsElement = document.getElementById('option-buttons')
const backButtonElement = document.getElementById('back-button'); // Back button
const speed = 30; /* The speed/duration of the effect in milliseconds */
let typingTimeout; // Save current timeout
let historyStack;

import textNodes from "./eg-story";

function typeWriter(txt, index = 0) {
    clearTimeout(typingTimeout); // Dừng hiệu ứng typing cũ trước khi chạy mới

    if (index === 0) textElement.innerHTML = ""; // Xóa nội dung cũ nếu bắt đầu lại

    if (index < txt.length) {
        textElement.innerHTML += txt.charAt(index);
        typingTimeout = setTimeout(() => typeWriter(txt, index + 1), speed);
    }
}

function changeBackground(url) {
    document.body.style.backgroundImage = `url('${url}')`; // Use template literal
}

function saveHistory(textNodeIndex) {
    if (textNodeIndex > 0 && !historyStack.includes(textNodeIndex)) {
        historyStack.push(textNodeIndex);
        localStorage.setItem("storyHistory", JSON.stringify(historyStack));
    }
}

function resetUI() {
    textElement.innerHTML = "";
    optionButtonsElement.innerHTML = "";
}

function createOptionButtons(options) {
    return options.map(option => {
        const button = document.createElement("button");
        button.innerText = option.text;
        button.classList.add("btn");
        button.disabled = true;
        button.addEventListener("click", () => {
            selectOption(option)
        });
        optionButtonsElement.appendChild(button);
        return button;
    });
}

function showTextNode(textNodeIndex) {
    clearTimeout(typingTimeout); // Dừng typing trước đó
    resetUI();
    
    const textNode = textNodes.find(node => node.id === textNodeIndex);
    const buttons = createOptionButtons(textNode.options);
    
    typeWriter(textNode.text); // Gọi typing mới
    setTimeout(() => buttons.forEach(button => button.disabled = false), textNode.text.length * speed);
    
    // backButtonElement.disabled = true;
    // setTimeout(() => backButtonElement.disabled = false, textNode.text.length * speed);

    changeBackground(textNode.background);
    updateBackButtonState();
}

function selectOption(option) {
    const nextTextNodeId = option.nextText;
    if (nextTextNodeId < 0) {
        resetGame();
    } else {
        saveHistory(option.nextText); // Save only when selecting a new branch
        showTextNode(nextTextNodeId);
    }
}


function goBack() {
    if (historyStack.length > 0) {
        historyStack.pop(); // Delete current stage
        let previousNode;
        if(historyStack.length == 0 || historyStack == null) {
            previousNode = 0;
        } else {
            previousNode = historyStack[historyStack.length - 1]; // Get the previous step
        }
        localStorage.setItem("storyHistory", JSON.stringify(historyStack));
        showTextNode(previousNode);
    }
}

// Update Back button state
function updateBackButtonState() {
    if (historyStack.length > 0) {
        backButtonElement.style.display = "block";
    } else {
        backButtonElement.style.display = "none";
    }
}

function resetGame() {
    historyStack = [];
    localStorage.setItem("storyHistory", JSON.stringify(historyStack));
    showTextNode(0);
}

function startGame() {
    historyStack = JSON.parse(localStorage.getItem("storyHistory")) || [];
    
    if (historyStack.length > 0) {
        showTextNode(historyStack[historyStack.length - 1]);
    } else {
        showTextNode(0);
    }
    document.getElementById("back-button").addEventListener("click", goBack);
}

startGame();