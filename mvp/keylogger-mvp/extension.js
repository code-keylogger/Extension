// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const request = require("request");

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
    "keylogger-mvp.startTesting",
    () => {
      recordKeyPresses();
      recordCursorMovements();
    }
  );

  let closing = vscode.commands.registerCommand(
    "keylogger-mvp.stopTesting",
    () => {
      writeState();
      finishTesting();
    }
  );

  // Display a message box to the user
  context.subscriptions.push(disposable);
  context.subscriptions.push(closing);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

function recordKeyPresses() {
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
      events.push(e);
    });
  });
}

function recordCursorMovements() {
  vscode.window.onDidChangeTextEditorSelection((event) => {
    event.selections.forEach((selection) => {
      const e = {
        active: selection.active,
        anchor: selection.anchor,
        end: selection.end,
        isReversed: selection.isReversed,
        start: selection.start,
      };
      events.push(e);
    });
  });
}

function finishTesting() {
  return true
}

function getID() {
  return "temp_id" 
}

function getProblemID() {
  return "temp_problem_id"
}

function writeState() {
  request.post(
    "http://virulent.cs.umd.edu:3000/save",
    {
      json: {
        userID: getID(),
        problemID: getProblemID(),
        start,
        end: Date.now(),
        events,
      },
    },
    function (error, response) {
      if (!error && response.statusCode == 200) {
        console.log(response.statusCode);
      } else {
        console.log(response);
      }
    }
  );
}