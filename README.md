# keylogger-mvp README

This keylogger allows for users to input their keystrokes for research purposes.
Once the new VSCode window has opened a user will open the Command Palette and type
'Start Testing'. Once the user does this they will be prompted to enter their email.
After the email is validated as being correct they will be told to select the
language they wish to code in. They will then be prompted to choose a problem set.
After that the extension will begin recording the user's actions and the user will
be able to see their problem question and how many tests they are passing. Once they
finish they will open the Command Palette and type in 'Stop Testing'. Once this is complete
the user will be prompted to copy the link to a survey and fill out it out in browser.

## Quick Start
1. If you have not already in the '/' folder run `npm i` to install packages
2. Open vscode and navigate your path to where extension.js is located
3. Once there run your f5 command or manually run extension.js either with or without debugging
4. Once the new window opens, Open the command palette (ctrl + shift + p in windows)
5. Type in Start Testing and press enter
6. Enter your email address in the window prompt, once typed press enter
7. Choose the language you are using by either selecting or typing one of the dropdown languages
8. Choose the problem set you are using by either selecting or typing one of the dropdown problem sets
9. Write your code once the problem appears
10. When finished open the command palette and type Stop Testing and press enter
11. A survey will prompt please copy the link into your browser and fill out the survey
12. If you wish to use the extension again please exit out and begin from step 2 (Assuming you still have the packages installed)



## Running extension.js Documentation Locally

If you wish to view the documentation for this program in webpage format please follow the steps bellow:

1. Where extension.js is located along your path run  './node_modules/.bin/jsdoc .\extension.js'
    or include 'Path To README.md \README.md' after '.\extension.js' in order to view this README.md on the Home page. (Recommended)
    ie: './node_modules/.bin/jsdoc .\extension.js path\to\readme\README.md\README.md'
2. This will create a folder called out.
3. Ensure your machine has the ability to open html files in browser.
4. Right click on extension.js.html and select the option "Open In Default Browser".
   or however you wish to open the html file.

