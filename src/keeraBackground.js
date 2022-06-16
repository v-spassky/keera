/*
 * Chrome extension background script for Keera. Modifies every page loaded in the browser
 * by showing a popup menu after highlighting text segment (usually a word),
 * suggesting adding the segment/word to a local storage. When a word is added to storage
 * with provided translation, it will be highlighted in the browser after subsequent encounters
 * with the provided translation being shown in a popup.
 */

const DEBUG = true;           // Enables logging debug information to the console.
const POPUP_OFFSET_PX = {     // Offset of the popup menu from the mouse cursor.
    x:  15,
    y: -15,
};
                              // Initial popup menu HTML.
const popupSnippet = `
    <div id="keeraPopupMenu"
         style="position: absolute; display: none; 
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
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wght@8..144,500&display=swap');
    </style>
`;

document.body.insertAdjacentHTML('beforeend', popupSnippet);
const popupMenu = document.getElementById('keeraPopupMenu')
const popupCloseBtn = document.getElementById('keeraClosePopupBtn');
const popupAddWordBtn = document.getElementById('addWordToKeeraBtn');
const selectedWordInput = document.getElementById('keeraSelectedWord');
const translationInput = document.getElementById('keeraTranslationInput');

let selectedText = '';

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

    if (popupMenu.style.display !== 'block') {
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

    if (selectedText) {
        popupMenu.style.left = `${mousePosition.x + POPUP_OFFSET_PX.x}px`;
        popupMenu.style.top = `${mousePosition.y + POPUP_OFFSET_PX.y}px`;
        popupMenu.style.display='block';
    }
}

function hidePopup() {

    /* 
     * Callback for a 'click' event on the popup close button.
     * Hides the popup menu. Flushes selected text value.
     */

    if (DEBUG) console.log(`Function hidePopup() triggered.`);

    popupMenu.style.display='none';

    selectedText = '';
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
}