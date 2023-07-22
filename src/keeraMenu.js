/*
 * Script that keeps extension menu (the one in the top right corner
 * of the browser`s window) running. Handles routing between layouts.
 */

const LAYOUTS = {
    MAIN_MENU: 'keeraMainMenu',
    DICTIONARY: 'keeraDictionaryLayout',
    SETTINGS: 'keeraSettingsLayout',
}

const backButtons = document.getElementsByName('backBtn');

let previousLayout = null;
let currentLayout = LAYOUTS.MAIN_MENU;

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
for (let button of backButtons) {
    button.addEventListener(
        'click',
        function () {switchLayout(previousLayout)}
    );
}

function switchLayout(layout) {
    document.getElementById(layout).style.display = 'block';
    previousLayout = currentLayout;
    document.getElementById(previousLayout).style.display = 'none';
    currentLayout = layout;
}

function getAllWordsFromKeera() {
    browser.storage.local.get(null).then((items) => {
        let dictionaryList = document.getElementById('keeraListOfTranslations');
        dictionaryList.innerHTML = '';
        for (let [word, translation] of Object.entries(items)) {
            let dictionaryEntry = document.createElement('li');
            dictionaryEntry.appendChild(document.createTextNode(`${word}: ${translation}`));
            dictionaryList.appendChild(dictionaryEntry);
        }
    }, onError);
}

function onError(error) {
    console.error(`Error: ${error}`);
}
