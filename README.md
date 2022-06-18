# Idea

This is a Chrome Extension for language learning. Lets the user annotate words or phrases with a translation. After saving the translation the translated word/phrase will be highlighted in all occurences and the provided translation will be shown on hover.

# Dependencies

- [Google fonts](https://fonts.google.com/) are used via a CDN.

# Workflow

Typical usecase scenario:

- Select any text fragment on a page;
- Type in a translation;
- Click 'Add to Keera'.

Afterwards the fragment will be highlighted on all pages when encountered. Translation will be shown on hover.

<img src="files_for_readme/demo_1.gif"
     width="1000"/>

# Project file structure

keera<br>
│<br>
├─ LICENSE<br>
├─ README.md<br>
├─ files_for_readme<br>
│ └── demo_1.gif<br>
├─ icons<br>
│ ├── keera_icon_128.png<br>
│ ├── keera_icon_16.png<br>
│ ├── keera_icon_32.png<br>
│ └── keera_icon_48.png<br>
├─ manifest.json_____________Instructions for Chrome for packaging<br>
└─ src<br>
. ├── keeraBackground.js_____Runs in the active tab<br>
. ├── keeraMenu.html________Popup menu shown in the top right corner in click<br>
. └── keeraMenu.js__________Keeps keeraMenu.html interactive<br>

# To do

- When something is selected show small icon at first, and let the user expand it if they actually want to add the selected word to Keera;
- Let the user set inline popup location in settings;
- Implement success alerts;
- Limit popup menu size;
- Implement editing/deleteing entries;
- Implement active search in dictionary in popup menu;
- Resolve issues with Z-index of the inline popup;
- Make inline popup draggable;
- Implement downloading and uploading word sets from/to Keera in .txt format.
