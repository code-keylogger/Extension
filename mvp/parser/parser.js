const events = require('events')
const path = require('path')
const readline = require('readline')
const fs = require('fs')

let filePath = path.join(__dirname, 'inp.txt')

async function readByLine() {
  var out = {}
  try {
    var rl = readline.createInterface({
      input: fs.createReadStream(filePath)
    });
    let parsed = []
    let i = 0 
    rl.on('line', (line) => {
      if(line.trim() !== "~~~") {
        if(line.trim().length > 0)
          parsed.push(line)
      } else {
        out[getName(i)] = parsed
        i++;
        parsed = []
      }
    })
    await events.once(rl, 'close')
    out[getName(i)] = parsed;
    out['html'] = getHtml(out)
    console.log(out)
  }
  catch (err) {
    console.log(err)
  }
}

function getHtml(out) {
  let output = `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cat Coding</title>
  </head>
  <body>
      <h1> Problem name: ${out["name"]}</h1>
      <hr>
      <h2> Description: <h2>
      <hr>
      <p><h5> ${out["description"]} </h5></p>
      <hr>
      <h3> Function signature: <code> ${out["funcSig"]} </code> </h3> 
      <hr>
      <h3> Test Cases: </h3>
      <ul>`;
  for (let i = 0; i < out["testCases"].length; i++){
    output += `<li>${out["testCases"][i]} -> ${out["answers"][i]}</li>`
  }
  output += `</ul></body></html>`

  return output;
}

function getName(i) {
  if (i === 0) {
    return "name"
  } else if (i === 1) {
    return "description"
  } else if (i === 2) {
    return "funcSig"
  } else if (i === 3) {
    return "testCases"
  } else if (i === 4) {
    return "answers"
  } else {
    throw new Error()
  }
}

readByLine()

// [PROBLEM NAME GOES HERE] add " STRICT" to diable external pasting
// ~~~
// [PROBLEM DESCRIPTION GOES HERE]
// ~~~
// [FUNCTION SIGNATURE AND STARTER CODE GOES HERE]
// ~~~
// [TEST CASES GO HERE]
// ([WRAP SECRET TEST CASES IN PARENTHESES])
// ~~~
// [CORRECT ANSWERS TO EACH TEST CASE GO HERE]

