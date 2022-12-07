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

## Using the Extension
1. Install the `.vsix` extension file into your instance of VSCode.
    a. Navigate to the extensions tab on the left of the window.
    b. Click the `...` in the upper right
    c. Select "install from vsix"
    d. Select the file
2. Make sure you have all the languages you will be using to solve problems installed on your local machine and referenced in your `$PATH`.
3. Start testing by pressing `f1` followed by `Start Testing`. You will be prompted to enter your email to procede. (This must be the email provided to your admin)
4. To move on to a following test press `f1` followed by `Next Test`.
5. When a problem is finished you can hit `f1 -> Stop Testing` to stop your session, or the session will automatically stop when you have passed all the tests.
6. You will be prompted with a survey upon the completion of a problem to leave your feedback.

## Developing and Altering the Extension

### Simple Config

1. To change the survey link, time limit, or any other configuration parameters make changes in `keylogger-mvp > pluginConfig.json`.
2. When changes have been made you simply repackage the plugin by running `vsce package` from the `keylogger-mvp/` directory.

### Debugging and Further Developement

1. To add additional features or fix any bugs you can make changes (likely to `extension.js`) from there you can debug the plugin.

    1. If you have not already installed the packages cd into keylogger-mvp and run `npm i`
    2. Open vscode and navigate your path to where extension.js is located
    3. Once there run your `f5` command or manually run extension.js either with or without debugging
    4. Once the new window opens, Open the command palette (ctrl + shift + p in windows)
    5. Type in `Start Testing` and press `enter`

2. To add additional language support you must:

    1. Add a new "runner file" in the `exec` directory. Follow the example of `compile.py`
    2. Add a new case to the `replacer.py` file
    3. Handle the new language in `runTest()` within `extension.js`
