const config = require("./pluginConfig.json");

const vscode = require("vscode");
const request = require("request");
const { initParams } = require("request");
const path = require("path");
const os = require("os");
const { exec } = require("child_process");
const { throws, rejects, fail } = require("assert");
const { prependOnceListener } = require("process");
const { fstat } = require("fs");
const { time } = require("console");
const { privateEncrypt } = require("crypto");
const { win32 } = require("path");
const _serverURL = config.serverURL;
let __userID = undefined;
let __problemID = undefined;
let __problem = undefined;
let language;
let isActive = false;
let failingTestID = [];
const pyvers = os.platform() === "win32" ? "python" : "python3";

var startTime;
var endTime;
let current = 0;
let total = 0;
let rightWindow;
let timer;

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
 * @inner
 */
function activate(context) {
  let disposable = vscode.commands.registerCommand(
    "keylogger-mvp.startTesting",
    // When the "Start Testing" command is run this arrow function gets run
    async () => {
      // Calls the function to authenticate the email
      isActive = true;
      authenticate();
    }
  );

  let next = vscode.commands.registerCommand(
    "keylogger-mvp.nextTest",
    async () => {
      events = [];
      nextTest();
      runTest();
    }
  );

  let closing = vscode.commands.registerCommand(
    // When the "Stop Testing" command is run this arrow function gets run
    "keylogger-mvp.stopTesting",
    () => {
      isActive = false;
      clearTimeout(timer)
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

function end() {
  vscode.window.showInformationMessage("You have run out of time");
  writeState();
  finishTesting();
  survey();
}

/**
 * Once the program finishes testing this function is called to prompt the user to fill out a survey.
 * @inner
 */
function survey() {
  vscode.window.showInformationMessage(
    `Please fill out a survey here: ${config.surveyLink}`
  );
}
/**
 * Displays a text box for user input
 * @param {boolean} triedBefore 
 * @inner
 */
async function authenticate(triedBefore = false) {
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
          setProblem(await fetchProblem()),
          (rightWindow = init()),
          recordKeyPresses(),
          recordCursorMovements();
        runTest();
        // If email is wrong have them restart and try again
      } else {
        authenticate(true);
      }
    });
}

/**
 * Runs tests on a users local machine to check to see if they are passing
 * the test they are on.
 * @inner
 */
function runTest() {
  if (isActive) {
    let pathOfPy = (os.platform() === 'win32')? `${__dirname}\\exec\\`:`${__dirname}/exec/`;
    if (os.platform() == 'win32')
      pathOfPy.replace(/\//g, "\\")
    const fs = require("fs");
    let json = JSON.stringify({ problem: __problem });
    fs.writeFileSync(`${pathOfPy}/prob.json`, json) 
      let uri = decodeURIComponent(vscode.window.activeTextEditor.document.uri.toString())
        .toString()
        .substring(7);
        uri = (os.platform() === "win32")? uri.substring(1).replace(/\//g, "\\"):uri
      if (language.toLowerCase() === "python") {
        exec(
          `cd ${pathOfPy}; ${pyvers} replacer.py ${uri}; ${pyvers} exec.py`,
          (os.platform() === "win32")? {'shell':'powershell.exe'}: {},
          (err, stdout, stderr) => {
            if (err || stderr) {
              console.log(err);
              current = 0;
              failingTestID = [];
              for (let i = 0; i < __problem.testCases.length; i++) {
                failingTestID.push(i);
              }
            } else {
                failingTestID = stdout.split("\n");
                failingTestID.pop();
                current = total - failingTestID.length;
                if (current == total) {
                  writeState();
                  finishTesting();
                  survey();
                }
              }
          }
        );
      } else if (language.toLowerCase() === "coq") {
        exec(
          `cd ${pathOfPy}; ${pyvers} replacer.py ${uri}`,
          (err, stdout, stderr) => {}
        );
        exec(`coqc ${pathOfPy}run.v`, (err, stdout, stderr) => {
          if (err || stderr) {
            current = 0;
          } else current = 1;
        });
      }
      updateStatus();
  }
}

/**
 * This method is called when the extension is deactivated, it is unreliable and most cleanup should be done on "Stop Testing"
 * @inner
 */
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

  panel.webview.html =
    "<h2>Start typing your solution and tests will be executed automatically</h2>";
  panel2.webview.html = __problem["html"];

  return panel;
}

/**
 * Records a users key press for any text change to the document.
 * @inner
 */
function recordKeyPresses() {
  // On document change handle event
  if (isActive) {
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
      });
    });
  }
}


/**
 * Records the position of the cursor inside the text box
 * @inner
 */
function recordCursorMovements() {
  if (isActive) {
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

/**
 * This is used to create an empty event upon the end of testing.
 * @inner
 */
function finishTesting() {
  events = [];
}

/**
 * This sets the problem to be displayed as well as creates a timer that will be 
 * set the amount of time allotted to finish the test. The timer resets every time
 * a new problem appears.
 * @param {any} problem 
 * @inner
 */
async function setProblem(problem) {
  startTime = new Date();
  endTime = new Date();
  endTime.setMinutes(endTime.getMinutes() + 20);
  var t =
    startTime.getHours() +
    "hr " +
    startTime.getMinutes() +
    "min " +
    startTime.getSeconds() +
    "sec";
  var te =
    endTime.getHours() +
    "hr " +
    endTime.getMinutes() +
    "min " +
    endTime.getSeconds() +
    "sec";
  timer = setTimeout(end, config.timerLength);
  vscode.window.showInformationMessage("You started at " + t);
  vscode.window.showInformationMessage(
    "You have until  " + te + " to complete all tests"
  );

  current = 0;
  __problem = problem;
  __problemID = problem._id;
  language = problem.lang;
  if (__problem.lang.toLowerCase() === "coq") total = 1;
  else total = __problem.testCases.length;
}

/**
 * A user inputs into an Input Box the next problem they will do. If they
 * do not specify a test a random one is chosen.
 * @inner
 */
async function nextTest() {
  writeState();
  let problemName = await vscode.window.showInputBox({
    title: "Choose Problem Name",
    prompt: "Not providing a name will result in a random problem",
  });
  clearTimeout(timer)
  setProblem(await fetchProblem(problemName));
  rightWindow = init();
}

/**
 * Creates the window to display the tests and if they are passing or not.
 * @param {any} passing 
 * @param {any} tests 
 * @returns a vscode web panel
 * @inner
 */
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
      ${getFailingTestDetails(failingTestID)}
  </body>
  </html>`;
}

/**
 * Returns the details of all the tests that are failing
 * @param {any} failingTestID 
 * @returns result of failed tests
 * @inner
 */
function getFailingTestDetails(failingTestID) {
  if (failingTestID.length === 0) {
    return "";
  }
  let result = "<h2>Failed Tests:</h2><ul>";
  for (let i = 0; i < failingTestID.length; i++) {
    result += `<li>Input: ${
      __problem.testCases[failingTestID[i]]
    } <br>Expected Output: ${__problem.answers[failingTestID[i]]}`;
  }
  result += "</ul>";
  return result;
}

/**
 * Writes the state in a post request to the server.
 * @inner
 */
function writeState() {
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
