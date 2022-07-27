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
     width="1000" style="max-width: 100%;"/>

A fragment can be deleted as well:

- Rightclick on a highlighted word;
- Click 'Delete'.

<img src="files_for_readme/demo_2.gif"
     width="1000" style="max-width: 100%;"/>

# Project file structure
```
keera
│
├─ LICENSE
├─ README.md
├─ files_for_readme
│ ├── demo_1.gif
│ └── demo_2.gif
├─ icons
│ ├── keera_icon_128.png
│ ├── keera_icon_16.png
│ ├── keera_icon_32.png
│ └── keera_icon_48.png
├─ manifest.json              // Instructions for Chrome for packaging
└─ src
  ├── keeraBackground.js      // Runs in the active tab
  ├── keeraMenu.html          // Popup menu shown in the top right corner in click
  └── keeraMenu.js            // Keeps keeraMenu.html interactive
```

# To do

- When something is selected show small icon at first, and let the user expand it if they actually want to add the selected word to Keera;
- Let the user set inline popup location in settings;
- Limit popup menu size;
- Implement active search in dictionary in popup menu;
- Resolve issues with Z-index of the inline popup;
- Make inline popup draggable;
- Implement downloading and uploading word sets from/to Keera in .txt format.
