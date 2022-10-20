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
    console.log(out)
  }
  catch (err) {
    console.log(err)
  }
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

