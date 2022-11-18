// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

const vscode = require("vscode");
const request = require("request");
const { initParams } = require("request");
const path = require("path");
const os = require("os")
const { exec } = require("child_process");
const { throws, rejects } = require("assert");
const { prependOnceListener } = require("process");
const _serverURL = "http://virulent.cs.umd.edu:3000";
let __userID = undefined;
let __problemID = undefined;
let __problem = undefined;
let language;
const pyvers = os.platform() === 'win32' ? 'python' : 'python'

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
 * This function is called when the extension starts.
 * It begins with the command  Start Testing.
 * and ends with the command Stop Testing in the Command Palette.
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "keylogger-mvp.startTesting",
    // When the "Start Testing" command is run this arrow function gets run
    async () => {
      // Calls the function to authenticate the email
    //   let problem;  
    //  await vscode.window.showInputBox({
    //     title: "Choose Problem Name",
    //     prompt: "Not providing a name will result in a random problem",
    //   }).then(val => { return val });
      authenticate();
      setProblem(await fetchProblem());
      runTest();
    }
  );

  let next = vscode.commands.registerCommand(
    "keylogger-mvp.nextTest",
    async () => {
      nextTest();
      runTest();
    }
  );

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
  context.subscriptions.push(next);
  context.subscriptions.push(disposable);
  context.subscriptions.push(closing);
}

/**
 * Once the program finishes testing this function is called to prompt the user to fill out a survey.
 * @inner
 */
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
        (__userID = isAuth.userid),
          (rightWindow = init()),
          recordKeyPresses(),
          recordCursorMovements();
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
    if 
    `cd ${pathOfPy}; python3 replacer.py ${vscode.window.activeTextEditor.document.uri
      .toString()
      .substring(7)}; python3 exec.py`,
    (err, stdout, stderr) => {
      if (err || stderr) {
        console.log(err);
        current = 0;
      } else current = total - stdout.split("\n").length + 1;
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

/**
 * This function prompts the user to choose a langugae from a predetermined set of languages in a dropdown bar.
 * It stores the selected option in a global variable.
 * @inner
 */
function languageOptions() {
  // displays the possible languages the user can choose from
  vscode.window
    .showQuickPick(["Python", "C", "Coq", "Java"], {
      title: "Language Selector",
      placeHolder: "Pick your language from the dropdown box.",
    })
    .then((a) => {
      // once selected the langugae is stored and calls the test options function to list the options
      language = a;
      testOptions();
    });
}

/**
 * This function prompts the user to choose a problem set from the options listed.
 * It can have different amounts of possible problem sets for each language.
 * It then stores the selected problem set in a variable.
 * @inner
 */
function testOptions() {
  // Stores the possible problem sets to be selected depending on the language chosen
  const python = [
    "Problem Set 1",
    "Problem Set 2",
    "Problem Set 3",
    "Problem Set 4",
  ];
  const c = ["Problem Set 1", "Problem Set 2"];
  const coq = ["Problem Set 1", "Problem Set 2", "Problem Set 3"];
  const java = ["Problem Set 1", "Problem Set 2"];
  let select;

  // depending on which language is chosen it matches the language to a list of problem sets
  switch (language) {
    case "Python":
      select = python;
      break;
    case "C":
      select = c;
      break;
    case "Coq":
      select = coq;
      break;
    case "Java":
      select = java;
      break;
  }

  // displays the problems to then be chosen by the user depending on which language was selected
  vscode.window
    .showQuickPick(select, {
      title: "Problem Selector",
      placeHolder: "Pick your Problem Set from the dropdown box.",
    })
    .then((a) => {
      init();
      recordKeyPresses();
      recordCursorMovements();
    });
}

/**
 * Initializes the panels that display the test question and the amount of tests passed.
 * @returns a vscode webViewPanel
 * @inner
 */
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

/**
 * This function updates the status of the passing tests window.
 * Every time a test passes it increases the amount of tests passed.
 * If a test fails it decreases the amount of tests passed.
 * @inner
 */
function updateStatus() {
  rightWindow.webview.html = getWebViewContent(current, total);
}

async function fetchProblem(userID, problemName) {
  let body = {};
  let param = "";

  if (userID) {
    param = `?userid=${userID}`;
  } else if (problemName) {
    param = `?name=${problemName}`;
  }
  var out = {};
  return new Promise((res, rej) => {
    request.get(
      {
        url: `${_serverURL}/problem${param}`,
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
  language = __problem.lang;
}

async function nextTest() {
  writeState();
  let problemName = await vscode.window.showInputBox({
    title: "Choose Problem Name",
    prompt: "Not providing a name will result in a random problem",
  });
  setProblem(await fetchProblem(problemName));
  init();
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
