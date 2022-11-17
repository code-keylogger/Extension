// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require("vscode");
const request = require("request");
const { initParams } = require("request");
const path = require("path");
const { exec } = require("child_process");
const { throws, rejects } = require("assert");
const { prependOnceListener } = require("process");
const _serverURL = "http://virulent.cs.umd.edu:3000";
let __userID = undefined;
let __problemID = undefined;
let __problem = undefined;

let current = 0;
let total = 0;
let rightWindow;

// TODO: for testing purposes
const log = true;
const start = Date.now();
let events = [];

const register = (email) => {
  let res = request.post(
    `${_serverURL}/register`,
    {
      json: { email },
    },
    function (error, response) {
      if (!error && response.statusCode == 200) {
        return response.body.userId;
      } else {
        return undefined;
      }
    }
  );
  return res;
};

function isAuthenticated(email) {
  return new Promise((res, rej) => {
    request.post(
      `${_serverURL}/login`,
      {
        json: { email },
      },
      function (error, response) {
        if (!error && response.statusCode == 200) {
          let id = response.body;
          if (id.userid) {
            res(id);
          } else {
            res(undefined);
          }
        } else {
          rej(undefined);
        }
      }
    );
  });
}

/**
 * @param {vscode.ExtensionContext} context
 */

// This function is called when the extension starts
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "keylogger-mvp.startTesting",
    // When the "Start Testing" command is run this arrow function gets run
    async () => {
      // Calls the function to authenticate the email
      setProblem(await fetchProblem());
      authenticate();
      runTest();
    }
  );

  let test = vscode.commands.registerCommand("keylogger-mvp.runTest", () => {
    console.log("test");
  });
  context.subscriptions.push(test);

  let closing = vscode.commands.registerCommand(
    // When the "Stop Testing" command is run this arrow function gets run
    "keylogger-mvp.stopTesting",
    () => {
      writeState();
      finishTesting();
      survey();
    }
  );

  // Listen to the provided commands
  context.subscriptions.push(disposable);
  context.subscriptions.push(closing);
}

// Prompts the user to fill out a survey when they finish
function survey() {
  vscode.window.showInformationMessage(
    "Please follow this link to fill out a survey about your experience."
  );
}

// Displays a text box for user input
async function authenticate(triedBefore = false) {
  let title = "Enter Your email";
  let prompt = "Enter your email";

  if (triedBefore) {
    title = "Incorrect information... Try again";
  }

  await vscode.window
    .showInputBox({
      title,
      prompt,
    })
    .then(async (a) => {
      // If the email is correct begin testing.
      let isAuth;
      try {
        isAuth = await isAuthenticated(a);
      } catch (e) {
        console.log(e);
      }

      if (isAuth && isAuth.userid) {
        ((__userID = isAuth.userid), 
          (rightWindow = init()),
          recordKeyPresses(),
          recordCursorMovements());
        // If email is wrong have them restart and try again
      } else {
        (true);
      }
    });
}

function runTest() {
  // var currentlyOpenTabfilePath = vscode.window.activeTextEditor.document.fileName;
  const pathOfPy = `${__dirname}/exec/`;
  exec(
    `cd ${pathOfPy}; python3 replacer.py ${vscode.window.activeTextEditor.document.uri
      .toString()
      .substring(7)}; python3 exec.py`,
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log(err);
        current = 0;
      } else current = total - stdout.split("\n").length;
    }
  );
  console.log(current);
}

// This method is called when the extension is deactivated, it is unreliable and most cleanup should be done on "Stop Testing"
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};

function init() {
  const panel = vscode.window.createWebviewPanel(
    "CodeCheck",
    "Status",
    vscode.ViewColumn.Two,
    {}
  );

  const panel2 = vscode.window.createWebviewPanel(
    "Testview",
    "Problem",
    vscode.ViewColumn.Three
  );

  total = __problem.testCases.length;
  panel.webview.html = getWebViewContent(current, total);
  panel2.webview.html = __problem["html"];

  return panel;
}

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
      vscode.workspace.saveAll(true);
      runTest();
      updateStatus();
    });
  });
}

// records the position of the cursor inside the text box
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
      // Push events to queue
      events.push(e);
    });
  });
}

function updateStatus() {
  rightWindow.webview.html = getWebViewContent(current, total);
}

async function fetchProblem(problemID, problemName) {
  let body = {};

  if (problemID) {
    body.problemID = problemID;
  } else if (problemName) {
    body.problemName = problemName;
  }
  var out = {};
  return new Promise((res, rej) => {
    request.get(
      {
        url: `${_serverURL}/problem`,
        json: true,
      },
      (error, response) => {
        if (!error && response.statusCode == 200) {
          res(response.body.problem);
        } else {
          rej(response);
        }
      }
    );
  });
}

function finishTesting() {
  return true;
}

function setProblem(problem) {
  __problem = problem;
  __problemID = problem._id;
  total = __problem.testCases.length;
}

async function nextTest() {
  writeState();
  setProblem(await fetchProblem());
}

function getWebViewContent(passing, tests) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Problem</title>
  </head>
  <body>
      <h1> Passing ${passing}/${tests} tests! </h1>
  </body>
  </html>`;
}

function writeState() {
  console.log(events);
  if (!log) return;
  request.post(
    `${_serverURL}/save`,
    {
      json: {
        userID: __userID,
        problemID: __problemID,
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
