// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const request = require("request")

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
		() => {
			recordKeyPresses();
			recordCursorMovements();
			logToDB();
		}
	);

	// Display a message box to the user
	context.subscriptions.push(disposable);
}

function logToDB(){
	writeToDatabase(
		{
			userID: getID(), 
			problemID: getProblemID(),
			start,
			end: Date.now(),
			events: events
		})
	setTimeout(logToDB, 5000);
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
				start: selection.start
			}
			// Push event to event Queue
			events.push(e);
		})
	})
}

function writeToTmpFolder(json) {
	const fs = require("fs");
	try {
		// Write data file in tmp folder
		fs.writeFileSync("/tmp/data.json", json);
		console.log("data written to /tmp/data.json");
	} catch (error) {
		console.error(error);
	}
}

function getID() {
	// TODO: implement id
	return "temp_id"
}

function getProblemID() {
	return "temp_problem_id"
}

function writeToDatabase(data) {
	request.post(
		'http://virulent.cs.umd.edu:3000/save',
		{json: data},
		function (error, response) {
			if (!error && response.statusCode == 200) {
				console.log(response.statusCode);
			} else {
				console.log( response)
			}
	})
}
