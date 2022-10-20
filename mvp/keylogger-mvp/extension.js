// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

const start = Date.now();
let events = [];

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "keylogger-mvp" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "keylogger-mvp.helloWorld",
    function () {
      // On document change handle event
      vscode.workspace.onDidChangeTextDocument((event) => {
        // For each content change store the location in file, changed text and time of event
        event.contentChanges.forEach((contentChange) => {
          const e = {
            startLine: contentChange.range.start.line,
            startChar: contentChange.range.start.character,
            endLine: contentChange.range.start.line,
            endChar: contentChange.range.end.character,
            textChange: contentChange.text,
            testsPassed: [],
            time: Date.now(),
          };
          // Push event to event Queue
          events.push(e);
          const obj = {
            start,
            events,
            end: Date.now(),
          };

          // Write object to JSON

          const json = JSON.stringify(obj, null, 4);
          const fs = require("fs");
          try {
            // Write data file in tmp folder
            fs.writeFileSync("/tmp/data.json", json);
            console.log("data written to /tmp/data.json");
          } catch (error) {
            console.error(error);
          }
        });
      });
    }
  );

  // Display a message box to the user

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
