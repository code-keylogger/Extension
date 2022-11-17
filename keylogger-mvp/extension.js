// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const testObj = {
  name: ["Binomial Coefficients Part 2"],
  description: [
    "Write a function that, given two integers N and K, returns N choose K, or the Binomial Coefficient of N and K, modulo 998244353 (a large prime).",
    "N and K can be up to 10,000 in this version of the problem",
  ],
  funcSig: ["binomial2(n, k)"],
  testCases: [
    "5 3",
    "9 4",
    "10 3",
    "10 6",
    "12 9",
    "12 4",
    "403 152",
    "9065 4356",
    "7693 2343",
    "2834 1433",
    "9879 5888",
  ],
  answers: [
    "10",
    "126",
    "120",
    "210",
    "220",
    "495",
    "275391141",
    "887300965",
    "505771294",
    "402685368",
    "81411887",
  ],
  html:
    "<!DOCTYPE html>\n" +
    '  <html lang="en">\n' +
    "  <head>\n" +
    '      <meta charset="UTF-8">\n' +
    '      <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    "      <title>Cat Coding</title>\n" +
    "  </head>\n" +
    "  <body>\n" +
    "      <h1> Problem name: Binomial Coefficients Part 2</h1>\n" +
    "      <hr>\n" +
    "      <h2> Description: <h2>\n" +
    "      <hr>\n" +
    "      <p> Write a function that, given two integers N and K, returns N choose K, or the Binomial Coefficient of N and K, modulo 998244353 (a large prime).,N and K can be up to 10,000 in this version of the problem </p>\n" +
    "      <hr>\n" +
    "      <h3> Function signature: <code> binomial2(n, k) </code> </h3> \n" +
    "      <hr>\n" +
    "      <h3> Test Cases: </h3>\n" +
    "      <ul><li>5 3 -> 10</li><li>9 4 -> 126</li><li>10 3 -> 120</li><li>10 6 -> 210</li><li>12 9 -> 220</li><li>12 4 -> 495</li><li>403 152 -> 275391141</li><li>9065 4356 -> 887300965</li><li>7693 2343 -> 505771294</li><li>2834 1433 -> 402685368</li><li>9879 5888 -> 81411887</li><li>(6 4) -> 15</li></ul></body></html>",
};

const vscode = require("vscode");
const request = require("request");
const { initParams } = require("request");
const path = require("path");
const { exec } = require("child_process");
const { throws } = require("assert");
const { prependOnceListener } = require("process");
let __userID = undefined;
let __problemID = undefined;
let __problem = undefined;
let current = 0;
let total = testObj.testCases.length;
let rightWindow;

// TODO: for testing purposes
const log = false;
const start = Date.now();
let events = [];

const register = (email) => {
  let res = request.post(
    "http://virulent.cs.umd.edu:3000/register",
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

const isAuthenticated = (email) => {
  let res = request.post(
    "http://virulent.cs.umd.edu:3000/login",
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

/**
 * @param {vscode.ExtensionContext} context
 */

// This function is called when the extension starts
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "keylogger-mvp.startTesting",
    // When the "Start Testing" command is run this arrow function gets run
    () => {
      // Calls the function to authenticate the email
      authenticate();
    }
  );

  //  context.subscriptions.push(vscode.commands.registerCommand(
  //   "keylogger-mvp.nextTest",
  //   () => {
  //     nextTest();
  //   }
  // ));

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
function authenticate(triedBefore = false) {
  let title = "Enter Your email";
  let prompt = "Enter your email";

  if (triedBefore) {
    title = "Incorrect information... Try again";
  }

  vscode.window
    .showInputBox({
      title,
      prompt,
    })
    .then((a) => {
      // If the email is correct begin testing.
      if (isAuthenticated(a)) {
        (rightWindow = init()), recordKeyPresses(), recordCursorMovements();
        // If email is wrong have them restart and try again
      } else {
        authenticate(true);
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
        current = 0;
      } else current = total + 1 - stdout.split("\n").length;
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

  panel.webview.html = getWebViewContent(current, total);
  panel2.webview.html = testObj["html"];

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

function fetchProblem(problemID, problemName) {
  let body = {};

  if (problemID) {
    body.problemID = problemID;
  } else if (problemName) {
    body.problemName = problemName;
  }

  request.post(
    "http://virulent.cs.umd.edu:3000/problem",
    { json: body },
    function (error, response) {
      if (!error && response.statusCode == 200) {
        __problem = response.body.problem;
      } else {
        console.log("TODO:", error);
      }
    }
  );
}

function finishTesting() {
  return true;
}

function nextTest() {
  writeState();
  fetchProblem();
}

function setUserID(userId) {
  __userID = userId;
}

function getID() {
  return __userID;
}

function getProblemID() {
  return __problemID;
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
  if (!log) return;
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
