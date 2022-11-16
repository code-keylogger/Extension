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
    "(6 4)",
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
    "15",
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
const { resolve } = require("path");
const { title } = require("process");
let current = 0;
let total = 69;
let rightWindow;
let language;
let problems;

// TODO: for testing purposes
const log = false;
const start = Date.now();
let events = [];

// TODO: Once the endpoint is configured enable this
// const isAuthenticated = (email) => {
//   let res = request.post(
//     "http://virulent.cs.umd.edu:3000/auth",
//     {
//       json: { email },
//     },
//     function (error, response) {
//       if (!error && response.statusCode == 200) {
//         return response.body.userId;
//       } else {
//         return undefined;
//       }
//     }
//   );
//   return res;
// };

// TODO: once the endpoint is configured remove this
const isAuthenticated = (email) => {
  return (email === '123') ? 'my_id' : undefined
}

/**
 * This function is called when the extension starts.
 * It begins with the command  Start Testing
 * and ends with the command Stop Testing in the Command Palette.
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

/**
 * Once the program finishes testing this function is called to prompt the user to fill out a survey.
 * @inner
 */
// Prompts the user to fill out a survey when they finish
function survey() {
  vscode.window.showInformationMessage(
    "Please follow this link to fill out a survey about your experience."
  );
}

/**
 * Ensures the user is using a proper email address so that their data is colelcted properly.
 * Creates a input box at the top of the vscode window to allow them to input their information.
 * If they enter an incorrect email they are prompted to try again.
 * @param {boolean} triedBefore 
 */
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
      // If the email is correct begin asking for the language they want to code in.
      if (isAuthenticated(a)) {
        languageOptions();
        // If email is wrong have them restart and try again
        
      } else {
        authenticate(true);
      }
    });
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
  vscode.window.showQuickPick(["Python", "C", "Coq", "Java"], {
    title: "Language Selector",
    placeHolder: "Pick your language from the dropdown box." 
  }).then((a) => {
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
  const python = ["Problem Set 1", "Problem Set 2", "Problem Set 3", "Problem Set 4"];
  const c = ["Problem Set 1", "Problem Set 2"];
  const coq = ["Problem Set 1", "Problem Set 2", "Problem Set 3"]
  const java = ["Problem Set 1", "Problem Set 2"]
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
      select = java
      break;
  }
  
  // displays the problems to then be chosen by the user depending on which language was selected
  vscode.window.showQuickPick(select, {
    title: "Problem Selector",
    placeHolder: "Pick your Problem Set from the dropdown box." 
  }).then((a) => {
    problems = a;
    init();
    recordKeyPresses();
    recordCursorMovements();
  }); 
}

/**
 * Initializes the panels that display the test question and the amount of tests passed
 * @returns a vscode webViewPanel
 * @inner
 */
function init() {
  vscode.window.showInformationMessage("You have picked the language " + language + " and "+ problems);
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

/**
 * Records everytime a key is pressed by the user. This is then stored in a json object
 * and eventually passed to the backend database.
 * @inner
 */
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
      console.log("test");
      updateStatus();
    });
  });
}

/**
 * Records the position of the cursor on the page. This is then stored
 * in a json object and passed to the backend.
 * @inner
 */
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
  current++;
}

/**
 * Once testing is over this is called and returns true.
 * @returns boolean
 * @inner
 */
function finishTesting() {
  return true;
}

/**
 * This will send a get request to the backend to get the userID
 * @returns String of the userID
 * @inner
 */
function getID() {
  return "temp_id";
}

/**
 * This will send a get request to the backend to get the problemID
 * @returns String of the problemID
 * @inner
 */
function getProblemID() {
  return "temp_problem_id";
}

/**
 * This gets the contests of the web view and displays them showing how many tests have been passed out
 * of the total.
 * @param {*} passing 
 * @param {*} tests 
 * @returns html
 * @inner
 */
function getWebViewContent(passing, tests) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <h1> Passing ${passing}/${tests} tests! </h1>
  </body>
  </html>`;
}

/**
 * Writes the json objects to the backend in the proper format.
 * @returns empty
 */
function writeState() {
  if (!log) return;
  request.post(
    "http://virulent.cs.umd.edu:3000/save",
    {
      json: {
        userID: getID(),
        problemID: getProblemID(),
        language: language,
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