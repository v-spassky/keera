/*
 * Chrome extension background script for Keera. Modifies every page loaded in the browser
 * by showing a popup menu after highlighting text segment (usually a word),
 * suggesting adding the segment/word to a local storage. When a word is added to storage
 * with provided translation, it will be highlighted in the browser after subsequent encounters
 * with the provided translation being shown in a popup.
 */

const DEBUG = false;           // Enables logging debug information to the console.
const POPUP_OFFSET_PX = {     // Offset of the popup menu from the mouse cursor.
    x:  15,
    y: -15,
};
                              // Initial popup menu HTML.
const popupSnippet = `
    <div id="keeraPopupMenu"
         class="hidden"
         style="position: absolute; 
                background-image: linear-gradient(to right, #8360c3, #2ebf91); 
                width: fit-content; height: fit-content;
                padding: 8px; border-radius: 8px;
                box-shadow: 4px 4px 4px 4px rgba(0, 0, 255, .1);
                font-family: 'Roboto Flex', sans-serif;">
        <input type="hidden"
               id="keeraSelectedWord"
               value="">
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
    </style>
`;

document.body.insertAdjacentHTML('beforeend', popupSnippet);
const popupMenu = document.getElementById('keeraPopupMenu')
const popupCloseBtn = document.getElementById('keeraClosePopupBtn');
const popupAddWordBtn = document.getElementById('addWordToKeeraBtn');
const selectedWordInput = document.getElementById('keeraSelectedWord');
const translationInput = document.getElementById('keeraTranslationInput');
const popupTranslationWondow = document.getElementById('keeraPopupTranslation');

let selectedText = '';
let wordsToHighlight = {};

getAllWordsFromKeera();

document.addEventListener('selectionchange', setSelectedText);
document.addEventListener('mouseup', showPopupIfSelectedText);
popupCloseBtn.addEventListener('click', hidePopup);
popupAddWordBtn.addEventListener(
    'click',
    function() {
        saveWordToKeera(selectedText, translationInput.value);
        hidePopup();
    }
);

// -------------------------- Event handlers -------------------------- //

function setSelectedText(event) {

    /* 
     * Callback for a 'selectionchange' event.
     * Sets global variable 'selectedText' to the highlighted text value.
     */

    if (DEBUG) console.log(`Function setSelectedText(event) triggered.`);

    if (popupMenu.classList.contains('hidden')) {
        selectedText = document.getSelection ? document.getSelection().toString() :  document.selection.createRange().toString();
    }

    if (DEBUG) console.log(`Selected text: '${selectedText}'.`);
}

function showPopupIfSelectedText(event) {

    /* 
     * Callback for a 'mouseup' event.
     * Shows the popup menu if the selected text is not empty.
     */

    if (DEBUG) console.log(`Function showPopupIfSelectedText() triggered.`);

    let mousePosition = {
        x: event.pageX,
        y: event.pageY,
    };

    if (selectedText && popupMenu.classList.contains('hidden')) {
        popupMenu.classList.remove('hidden');
        popupMenu.classList.add('visible');
        popupMenu.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
        popupMenu.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
        translationInput.placeholder=`Translation for '${selectedText}'...`;
    }
}

function hidePopup() {

    /* 
     * Callback for a 'click' event on the popup close button.
     * Hides the popup menu. Flushes selected text value.
     */

    if (DEBUG) console.log(`Function hidePopup() triggered.`);

    popupMenu.classList.remove('visible');
    popupMenu.classList.add('hidden');
    translationInput.value='';
    selectedText = '';
}

function showTranslation(event) {

    /* 
     * Shows the translation of the selected word in a popup.
     */

    if (DEBUG) console.log(`Function showTranslation() triggered.`);

    let mousePosition = {
        x: event.pageX,
        y: event.pageY,
    };

    popupTranslationWondow.classList.remove('hidden');
    popupTranslationWondow.classList.add('visible');
    popupTranslationWondow.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
    popupTranslationWondow.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
    popupTranslationWondow.innerText = event.target.getAttribute('data-translation');
}

function hideTranslation() {

    /* 
     * Hides the translation of the selected word in a popup.
     */

    if (DEBUG) console.log(`Function hideTranslation() triggered.`);

    popupTranslationWondow.classList.remove('visible');
    popupTranslationWondow.classList.add('hidden');
}

// ------------------ Operations with Chrome storage ------------------ //

function saveWordToKeera(word, translation) {

    /* 
     * Saves a word to the Chrome storage.
     * The word is saved as a key and the translation as a value.
     */

    if (DEBUG) console.log(`Function saveWordToKeera() triggered.`);
    if (DEBUG) console.log(`Going to try saving word '${word}' with translation: '${translation}'.`);

    chrome.storage.sync.set(
        {[word]: translation}, 
        function() {
            if (DEBUG) console.log(`Word '${word}' added to Keera with following translation: '${translation}'.`);
        }
    );

    translationInput.value = '';
    getAllWordsFromKeera();
}

function getAllWordsFromKeera() {

    /* 
     * Fills the dictionary layout with words from Keera local storage.
     */

    let p = new Promise(function (resolve, reject) {
        keeraStorage = {};
        chrome.storage.sync.get(
            null, 
            function(keeraStorage) {
                resolve(keeraStorage);
            }
        );
    });
        p.then(function (keeraStorage) {
            wordsToHighlight = {...keeraStorage};
            highlightAllWords();
            const highlightedWords = document.getElementsByName('keeraHighlightedWord');
            if (DEBUG) console.log(`Highlighted words count: ${highlightedWords.length}.`);
            for (let wordElement of highlightedWords) {
                if (DEBUG) console.log(`Adding event listener to word ${wordElement}.`);
                wordElement.addEventListener('mouseenter', showTranslation);
                wordElement.addEventListener('mouseleave', hideTranslation);
            }
        }
    );
}

// ----------------------- Highlighting system ----------------------- //

function highlightAllWords() {

    /* 
     * Recursively searches through DOM for words listed in
     * global 'wordsToHighlight' list and substitutes them with <span> elements.
     */

    if (DEBUG) console.log(`Function highlightAllWords() triggered.`);

    let allBodyElements = document.querySelectorAll('body *');

    if (DEBUG) console.log(`Found ${allBodyElements.length} elements in the body.`);

    for (DOMElement of allBodyElements) {

        if (DEBUG) console.log(`Checking element: '${DOMElement}'.`);

        for ([word, translation] of Object.entries(wordsToHighlight)) {

            if (DEBUG) console.log(`Checking if '${word}' is in '${DOMElement.innerText}'.`);

            elementText = DOMElement.innerText || [];

            if (elementText.includes(word)) {

                if (DEBUG) console.log(`Found word '${word}' in element with innerText: '${DOMElement.innerText}'.`);

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