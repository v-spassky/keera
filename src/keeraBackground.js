/*
 * Browser extension background script for Keera. Modifies every page loaded
 * in the browser by showing a popup menu after highlighting text segment
 * (usually a word), suggesting adding the segment/word to a local storage.
 * When a word is added to storage with provided translation, it will be
 * highlighted in the browser after subsequent encounters with the provided
 * translation being shown in a popup.
 */

const POPUP_OFFSET_PX = { x: 15, y: -15 };

const popupSnippet = `
    <div id="keeraPopupMenu"
         class="hidden"
         style="position: absolute;
                background-image: linear-gradient(to right, #8360c3, #2ebf91);
                width: fit-content; height: fit-content;
                padding: 8px; border-radius: 8px;
                box-shadow: 4px 4px 4px 4px rgba(0, 0, 255, .1);
                font-family: 'Roboto Flex', sans-serif;">
        <input type="text"
               placeholder="Translation..."
               id="keeraTranslationInput"
               style="padding: 6px;
                      border-radius: 9999px; border: none; outline: none;
                      opacity: 0.6;
                      font-family: 'Roboto Flex', sans-serif;">
        <button id="addWordToKeeraBtn"
                style="padding: 6px;
                       border: none;
                       cursor: pointer;
                       background-color: rgba(117, 190, 218, 0.0);
                       text-decoration: underline;
                       font-weight: 450;
                       color: white;
                       font-family: 'Roboto Flex', sans-serif;">
            Add to Keera
        </button>
        <button id="keeraClosePopupBtn"
                style="position: absolute; top: -7px; right: -7px;
                       width: 14px; height: 14px;
                       border-radius: 9999px; border: none;
                       color: white; font-weight: bolder;
                       background: rgb(239,23,12);
                       background: linear-gradient(90deg, rgba(239,23,12,1) 0%, rgba(255,124,30,1) 100%);
                       cursor: pointer;
                       font-family: 'Roboto Flex', sans-serif;">
        </button>
    </div>
    <div id="keeraPopupTranslation"
         class="hidden"
         style="position: absolute;
                background: rgb(106,200,196);
                background: linear-gradient(90deg, rgba(106,200,196,1) 0%, rgba(60,131,130,1) 100%);
                color: white; font-weight: 400;
                width: fit-content; height: fit-content;
                padding: 3px; border-radius: 3px;
                box-shadow: 1px 1px 1px 1px rgba(0, 0, 255, .1);
                font-family: 'Roboto Flex', sans-serif;">
    </div>
    <button id="keeraDeleteTranslationBtn"
            class="hidden"
            style="position: absolute;
                   width: fit-content; height: fit-content;
                   padding: 6px;
                   border-radius: 4px; border: none;
                   color: white; font-weight: 400;
                   background: rgb(239,23,12);
                   background: linear-gradient(90deg, rgba(239,23,12,1) 0%, rgba(255,124,30,1) 100%);
                   cursor: pointer;
                   font-family: 'Roboto Flex', sans-serif;">
        Delete
    </button>
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,500&display=swap');

    #keeraPopupMenu {
        transition: all 1s ease-out 0.25s;
    }

    #keeraPopupMenu.hidden {
        opacity: 0;
        visibility: hidden;
    }

    #keeraPopupMenu.visible {
        opacity: 1;
        visibility: visible;
    }

    #keeraPopupTranslation {
        transition: all 1s ease-out 0.25s;
        transition-property: opacity, visibility;
    }

    #keeraPopupTranslation.hidden {
        opacity: 0;
        visibility: hidden;
    }

    #keeraPopupTranslation.visible {
        opacity: 1;
        visibility: visible;
    }

    #keeraDeleteTranslationBtn {
        transition: all 1s ease-out 0.25s;
        transition-property: opacity, visibility;
    }

    #keeraDeleteTranslationBtn.hidden {
        opacity: 0;
        visibility: hidden;
    }

    #keeraDeleteTranslationBtn.visible {
        opacity: 1;
        visibility: visible;
    }
    </style>
`;

document.body.insertAdjacentHTML('beforeend', popupSnippet);
const popupMenu = document.getElementById('keeraPopupMenu')
const popupCloseBtn = document.getElementById('keeraClosePopupBtn');
const popupAddWordBtn = document.getElementById('addWordToKeeraBtn');
const translationInput = document.getElementById('keeraTranslationInput');
const popupTranslationWindow = document.getElementById('keeraPopupTranslation');
const popupDeleteTranslationBtn = document.getElementById('keeraDeleteTranslationBtn');

let selectedText = '';
let wordsToHighlight = {};

getAllWordsFromKeera();

document.addEventListener('selectionchange', setSelectedText);
document.addEventListener('mouseup', showPopupIfSelectedText);
popupCloseBtn.addEventListener('click', hidePopup);
popupAddWordBtn.addEventListener(
    'click',
    function () {
        saveWordToKeera(selectedText, translationInput.value);
        hidePopup();
    }
);
popupDeleteTranslationBtn.addEventListener(
    'click',
    deleteWordFromKeera
);

// ----------------------------- Event handlers ---------------------------- //

function setSelectedText(_event) {
    if (popupMenu.classList.contains('hidden')) {
        if (document.getSelection) {
            selectedText = document.getSelection().toString();
        } else {
            selectedText = document.selection.createRange().toString();
        }
    }
}


function showPopupIfSelectedText(event) {
    let mousePosition = {
        x: event.pageX,
        y: event.pageY,
    };

    if (selectedText && popupMenu.classList.contains('hidden')) {
        popupMenu.classList.remove('hidden');
        popupMenu.classList.add('visible');
        popupMenu.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
        popupMenu.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
        translationInput.placeholder = `Translation for '${selectedText}'...`;
    }
}

function hidePopup() {
    popupMenu.classList.remove('visible');
    popupMenu.classList.add('hidden');
    translationInput.value = '';
    selectedText = '';
}

function showTranslation(event) {
    let mousePosition = {
        x: event.pageX,
        y: event.pageY,
    };

    popupTranslationWindow.classList.remove('hidden');
    popupTranslationWindow.classList.add('visible');
    popupTranslationWindow.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
    popupTranslationWindow.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
    popupTranslationWindow.innerText = event.target.getAttribute('data-translation');
}

function hideTranslation() {
    popupTranslationWindow.classList.remove('visible');
    popupTranslationWindow.classList.add('hidden');
}

function showDeleteBtn(event) {
    event.preventDefault();
    let mousePosition = {
        x: event.pageX,
        y: event.pageY,
    };

    popupDeleteTranslationBtn.classList.remove('hidden');
    popupDeleteTranslationBtn.classList.add('visible');
    popupDeleteTranslationBtn.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
    popupDeleteTranslationBtn.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
    popupDeleteTranslationBtn.setAttribute('data-word-to-delete', event.target.innerText);

    setTimeout(hideDeleteBtn, 4000);
}

function hideDeleteBtn() {
    popupDeleteTranslationBtn.classList.remove('visible');
    popupDeleteTranslationBtn.classList.add('hidden');
    popupDeleteTranslationBtn.setAttribute('data-word-to-delete', '');
}

// ------------- Operations with the browser extension storage ------------- //

function saveWordToKeera(word, translation) {
    browser.storage.local.set({ [word]: translation }).then(() => { }, onError);
    translationInput.value = '';
    getAllWordsFromKeera();
}

function getAllWordsFromKeera() {
    browser.storage.local.get(null).then((items) => {
        wordsToHighlight = { ...items };
        highlightAllWords();
        const highlightedWords = document.getElementsByName('keeraHighlightedWord');
        for (let wordElement of highlightedWords) {
            wordElement.addEventListener('mouseenter', showTranslation);
            wordElement.addEventListener('mouseleave', hideTranslation);
            wordElement.addEventListener('contextmenu', showDeleteBtn);
        }
    }, onError);
}

function deleteWordFromKeera() {
    let wordToDelete = popupDeleteTranslationBtn.getAttribute('data-word-to-delete');

    browser.storage.local.remove(wordToDelete).then(() => {
        hideDeleteBtn();
        popupDeleteTranslationBtn.setAttribute('data-word', '');

        let elementsToUnhighlight = document.querySelectorAll('span[name="keeraHighlightedWord"]');
        elementsToUnhighlight.forEach(function (element) {
            if (element.innerText === wordToDelete) {
                element.outerHTML = element.innerText;
            }
        });
    }, onError);
}

function onError(error) {
    console.error(`Error: ${error}`);
}


// -------------------------- Highlighting system -------------------------- //


function highlightAllWords() {
    let allBodyElements = document.querySelectorAll('body *');
    for (let DOMElement of allBodyElements) {
        if (isHidden(DOMElement)) {
            continue;
        }
        for (let [word, translation] of Object.entries(wordsToHighlight)) {
            let elementText = DOMElement.innerText || [];
            if (elementText.includes(word)) {
                let span = document.createElement('span');
                span.innerText = word;
                span.style.background = 'linear-gradient(to right, #8360c3, #2ebf91)';
                span.style.boxShadow = '2px 2px 2px 2px rgba(0, 0, 255, .1)'
                span.style.color = 'white';
                span.style.borderRadius = '3px';
                span.style.padding = '2px';
                span.setAttribute('name', 'keeraHighlightedWord');
                span.setAttribute('data-translation', translation);
                DOMElement.innerHTML = DOMElement.innerHTML.replaceAll(word, span.outerHTML);
            }
        }
    }
}

function isHidden(el) {
    let style = window.getComputedStyle(el);
    let isCSSHidden = (style.display === 'none') || (style.visibility === 'hidden');
    let isZeroSize = el.offsetWidth === 0 && el.offsetHeight === 0;
    let isOffScreen = el.getBoundingClientRect().left < 0;
    let isInvisible = el.tagName === "SCRIPT" || el.tagName === "STYLE";
    return isCSSHidden || isZeroSize || isOffScreen || isInvisible;
}
