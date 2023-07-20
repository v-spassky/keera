/*
 * Script that keeps extension menu (the one in the top right corner
 * of the browser`s window) running. Handles routing between layouts.
 */

const DEBUG = true;     // Enables logging debug information to the console.
const LAYOUTS = {       // Maps layout names to the ids of the corresponding HTML elements.
    MAIN_MENU: 'keeraMainMenu',
    DICTIONARY: 'keeraDictionaryLayout',
    SETTINGS: 'keeraSettingsLayout',
}
                        // Collects all back buttons in the document.
const backButtons = document.getElementsByName('backBtn');

                        // Global variables that store layout names for navigating back and forth.
let previousLayout = null;
let currentLayout = LAYOUTS.MAIN_MENU;

                        // Bind all routing buttous to corresponding layouts.
document.getElementById('dictionaryBtn').addEventListener(
    'click',
    function () {
        switchLayout(LAYOUTS.DICTIONARY);
        getAllWordsFromKeera();
    }
);
document.getElementById('settingsBtn').addEventListener(
    'click',
    function () {switchLayout(LAYOUTS.SETTINGS)}
);
for (button of backButtons) {
    button.addEventListener(
        'click',
        function () {switchLayout(previousLayout)}
    );
}

function switchLayout(layout) {

    /*
     * Callback for switching between layouts.
     * Sets current layout`s display property to 'none' and new layout`s display property to 'block'.
     */

    if (DEBUG) console.log('Function switchLayout() triggerd');
    if (DEBUG) console.log(`Layouts before: previousLayout: ${previousLayout}, currentLayout: ${currentLayout}`);

    document.getElementById(layout).style.display = 'block';
    previousLayout = currentLayout;
    document.getElementById(previousLayout).style.display = 'none';
    currentLayout = layout;

    if (DEBUG) console.log(`Layouts after: previousLayout: ${previousLayout}, currentLayout: ${currentLayout}`);
}

function getAllWordsFromKeera() {

    /*
     * Fills the dictionary layout with words from Keera local storage.
     */

    if (DEBUG) console.log(`Function getAllWordsFromKeera() triggered.`);

    chrome.storage.sync.get(
        null,
        function(keeraStorage) {

            if (DEBUG) console.log(`Current storage object: ${JSON.stringify(keeraStorage)}`);

            dictionaryList = document.getElementById('keeraListOfTranslations');
            dictionaryList.innerHTML = '';

            for ([word, translation] of Object.entries(keeraStorage)) {

                let dictionaryEntry = document.createElement('li');
                dictionaryEntry.appendChild(document.createTextNode(`${word}: ${translation}`));
                dictionaryList.appendChild(dictionaryEntry);

            }
        }
    );
}