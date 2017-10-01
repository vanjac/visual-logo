var WHITESPACE = ['\n', ' ', '\t'];

var box = document.getElementById("scriptbox");

/* EDITOR STATE */
var currentBlankSelectionStart = null;

/* SCRIPT STATE */
var scriptStarted = false;
var scriptRunning = false;
var scriptLineTokens = []; // array of arrays of tokens
var scriptRanges = []; // a stack of (start, end, current line) arrays

var stepDelayTime;

/* EDITOR */

function cursorChanged(justAddedBlock) {
    if(getSelectionStart(box) != getSelectionEnd(box)) {
        // something is selected
        currentBlankSelectionStart = null;
        setBlocks([]);
        return;
    }

    var pos = getCaretPosition(box);

    // make sure there's always a new line at the bottom
    if(box.value.length > 0 && box.value.charAt(box.value.length - 1) != '\n') {
        box.value += '\n';
        setCaretPosition(box, pos);
    }

    var blocksAdded = false;
    if(cursorOnCharacter(box.value, pos, ['_'])) {
        var blankStart = pos;
        while(blankStart > 0 && box.value.charAt(blankStart-1) == '_') {
            blankStart--;
        }
        var blankEnd = pos;
        while(blankEnd < box.value.length && box.value.charAt(blankEnd) == '_'){
            blankEnd++;
        }
        if(currentBlankSelectionStart == blankStart) {
            currentBlankSelectionStart = null;
            return;
        }
        currentBlankSelectionStart = blankStart;
        setSelection(box, blankStart, blankEnd);
        blocksAdded = addBlocksAtCursor(pos);
    } else if(cursorOnCharacter(box.value, pos, WHITESPACE)) {
        currentBlankSelectionStart = null;
        blocksAdded = addBlocksAtCursor(pos);
    } else {
        currentBlankSelectionStart = null;
        setBlocks([]);
    }
    var onNewLine = pos == box.value.length || box.value.charAt(pos) == '\n';
    if(!blocksAdded && justAddedBlock && onNewLine) {
        // start a new line
        box.value = box.value.substring(0, pos) + '\n'
            + box.value.substring(pos);
        setCaretPosition(box, pos + 1);
        cursorChanged(false);
    }
}

// return if any blocks were added
function addBlocksAtCursor(pos) {
    var lineBeforeCursor = box.value.substring(
        lineStart(box.value, pos), pos);
    tokensBeforeCursor = tokenize(lineBeforeCursor);
    // return if inside a string...
    if(tokensBeforeCursor.length > 0) {
        var lastToken = tokensBeforeCursor[tokensBeforeCursor.length-1];
        if(lastToken.charAt(0) == '"') {
            if(lastToken.length == 1) {
                setBlocks([]);
                return;
            } else if(lastToken.charAt(lastToken.length - 1) != '"') {
                setBlocks([]);
                return;
            }
        }
        if(lastToken.charAt(0) == '_') {
            tokensBeforeCursor.pop();
        }
    }
    var matchedBlocks = [];
    for(var i = 0; i < BLOCKS.length; i++) {
        if(BLOCKS[i].rule(tokensBeforeCursor))
            matchedBlocks.push(BLOCKS[i]);
    }
    setBlocks(matchedBlocks);
    return matchedBlocks.length != 0;
}

function cursorOnCharacter(value, cursor, charSet) {
    return cursor == 0 || cursor == value.length ||
           charSet.indexOf(value.charAt(cursor)) != -1 ||
           charSet.indexOf(value.charAt(cursor-1)) != -1;
}

function lineStart(value, cursor) {
    var lastIndex = value.substring(0, cursor).lastIndexOf('\n');
    if(lastIndex == -1)
        lastIndex = 0;
    return lastIndex;
}

function lineEnd(value, cursor) {
    var index = value.substring(cursor).indexOf('\n');
    if(index == -1)
        return value.length;
    return index + cursor;
}

function tokenize(line) {
    var tokens = [];
    var currentToken = "";
    var inString = false;
    line += " "; // process last token
    for(var i = 0; i < line.length; i++) {
        var c = line.charAt(i);
        if(inString) {
            if(c == '"') {
                inString = false;
                tokens.push(currentToken += '"');
                currentToken = "";
            } else {
                currentToken += c;
            }
        } else {
            if(c == '"') {
                inString = true;
                if(currentToken != "") {
                    tokens.push(currentToken);
                }
                currentToken = "" + c;
            } else if(WHITESPACE.indexOf(c) != -1) {
                if(currentToken != "") {
                    tokens.push(currentToken);
                    currentToken = "";
                }
            } else if(c == ':') {
                if(currentToken != "") {
                    tokens.push(currentToken);
                    currentToken = "";
                }
                tokens.push(':');
            } else {
                currentToken += c;
            }
        }
    }
    if(inString) {
        // missing end quote
        tokens.push(currentToken);
    }
    return tokens;
}

function setBlocks(blocks) {
    var blocksDiv = document.getElementById("blocks");
    var html = "";
    for(var i = 0; i < blocks.length; i++) {
        var block = blocks[i];
        var name = block.text;
        var displayName = name.replace(":", ": ... ");
        var cursorOffset = block.cursorOffset;
        if(!cursorOffset)
            cursorOffset = 0;
        html += "<a href=\"javascript:void(0)\" onclick='blockSelect(\"" +
            name + "\"," + cursorOffset +
            ");'><span class=\"block\">" +
            displayName +
            "</span></a>";
    }
    blocksDiv.innerHTML = html;
}

function blockSelect(text, cursorOffset) {
    text = text.replace(":", ":\n\n");
    var selStart = getSelectionStart(box);
    var selEnd = getSelectionEnd(box);
    if(selStart != 0 && WHITESPACE.indexOf(box.value.charAt(selStart - 1)) == -1)
        text = " " + text;
    if(WHITESPACE.indexOf(box.value.charAt(selEnd)) == -1) {
        text += " ";
        if(cursorOffset < 0)
            cursorOffset--;
    }
    box.value = box.value.substring(0, selStart) + text
        + box.value.substring(selEnd);
    setCaretPosition(box, selStart + text.length + cursorOffset);
    box.focus();
    cursorChanged(true);
}

/* RUN SCRIPT */

function speedChange() {
    stepDelayTime = Number(document.getElementById("speedselect").value);
}

function runStateChanged() {
    var runStateP = document.getElementById("runstate");
    var runButton = document.getElementById("runbutton");
    var resetButton = document.getElementById("resetbutton");
    var pauseButton = document.getElementById("pausebutton");
    var stopButton = document.getElementById("stopbutton");
    var stepButton = document.getElementById("stepbutton");
    if(scriptStarted) {
        box.disabled = true;
        resetButton.style.display = "none";
        stopButton.style.display = "inline";
        if(scriptRunning) {
            runStateP.innerHTML = "Running...";
            runButton.style.display = "none";
            pauseButton.style.display = "inline";
            stepButton.style.display = "none";
        } else {
            runStateP.innerHTML = "Paused";
            runButton.style.display = "inline";
            pauseButton.style.display = "none";
            stepButton.style.display = "inline";
        }
    } else {
        box.disabled = false;
        runStateP.innerHTML = "Stopped";
        runButton.style.display = "inline";
        resetButton.style.display = "inline";
        pauseButton.style.display = "none";
        stopButton.style.display = "none";
        stepButton.style.display = "inline";
    }
    updateLineIndicator();
}

function errorMessage(line, error) {
    return "Error on line " + (line + 1) + ": " + error;
}

function startScript() {
    var script = box.value;

    // tokenize
    var lines = script.split("\n");
    scriptLineTokens = [];
    for(var lineNum = 0; lineNum < lines.length; lineNum++)
        scriptLineTokens.push(tokenize(lines[lineNum]));

    errors = checkErrors(scriptLineTokens);
    if(errors.length != 0) {
        alert(errors.join('\n'));
        return false;
    }

    scriptLineNum = 0;
    scriptRanges = [ [0, lines.length, 0] ];
    scriptStarted = true;
    return true;
}

function run() {
    if(!scriptStarted)
        if(!startScript())
            return;
    scriptRunning = true;
    runStateChanged();
    runStep();
}

function stop() {
    scriptStarted = false;
    scriptRunning = false;
    scriptRanges = [];
    runStateChanged();
}

function pause() {
    scriptRunning = false;
    runStateChanged();
}

function resume() {
    scriptRunning = true;
    runStateChanged();
    runStep();
}

function step() {
    if(!scriptStarted)
        if(!startScript())
            return;
    runStateChanged();
    runStep();
}

// true for error
function runStep(lines, start, end) {
    if(scriptRanges.length == 0) {
        scriptStarted = false;
        scriptRunning = false;
        runStateChanged();
        return;
    }
    updateLineIndicator();
    range = scriptRanges[scriptRanges.length - 1];
    var start = range[0];
    var end = range[1];
    var lineNum = range[2];
    if(lineNum == end) {
        scriptRanges.pop();
        runStep(); // immediately, without scheduling
        return;
    }

    var tokens = scriptLineTokens[lineNum];
    if(tokens.length == 0) {
        range[2]++;
        scheduleNextStep();
        return;
    }
    var result = runCommand(tokens);
    if(result) {
        if(!isNaN(result)) {
            // repeat block
            var repeatEnd = findEnd(scriptLineTokens, lineNum, end);
            if(repeatEnd == null) {
                alert(errorMessage(lineNum, "Missing end"));
                scriptStarted = false;
                scriptRunning = false;
                runStateChanged();
                return;
            }
            range[2] = repeatEnd;
            for(var i = 0; i < result; i++)
                scriptRanges.push([lineNum + 1, repeatEnd, lineNum + 1]);
        } else {
            // error
            alert(errorMessage(lineNum, result));
            scriptStarted = false;
            scriptRunning = false;
            runStateChanged();
            return;
        }
    }
    range[2]++;
    scheduleNextStep();
}

function scheduleNextStep() {
    if(!scriptRunning)
        return;
    if(stepDelayTime < 0)
        runStep();
    else
        setTimeout(runStep, stepDelayTime);
}

function updateLineIndicator() {
    box.value = box.value.replace(" <--", "");
    if(scriptStarted && scriptRanges.length > 0 && stepDelayTime > 50) {
        lines = box.value.split('\n');
        lineNum = scriptRanges[scriptRanges.length - 1][2];
        lines[lineNum] += " <--";
        box.value = lines.join("\n");
    }
}

function findEnd(lineTokens, start, end) {
    var lineNum = start + 1;
    var nest = 0;
    while(true) {
        if(lineNum == end) {
            return null;
        }
        var tokens = lineTokens[lineNum];
        if(tokens.length > 0) {
            if(tokens[tokens.length - 1] == ":")
                nest++;
            else if(tokens[0] == "end") {
                if(nest == 0)
                    return lineNum;
                else
                    nest--;
            }
        }
        lineNum++;
    }
}

function checkErrors(lineTokens) {
    var errors = [];

    for(var lineNum = 0; lineNum < lineTokens.length; lineNum++) {
        var lTokens = lineTokens[lineNum];
        for(var tokenNum = 0; tokenNum < lTokens.length; tokenNum++) {
            var t = lTokens[tokenNum];
            if(!isNaN(t))
                continue;
            if(t == ":")
                continue;
            if(t.charAt(0) == '#')
                continue;
            if(t.charAt(0) == '"') {
                if(t.length == 1 || t.charAt(t.length - 1) != '"') {
                    errors.push(errorMessage(lineNum, "Unmatched quote"));
                }
                continue;
            }
            if(t.charAt(0) == '_') {
                errors.push(errorMessage(lineNum, "Unfilled blank"));
                continue;
            }
            if(VOCAB.indexOf(t) == -1) {
                errors.push(errorMessage(lineNum, "Unknown word " + t));
            }
        }
    }

    return errors;
}

/* UTILS */

// from: http://stackoverflow.com/questions/512528/set-cursor-position-in-html-textbox
function setCaretPosition(elem, caretPos) {
    if(elem != null) {
        if(elem.createTextRange) { // Legacy IE
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        } else {
	    elem.focus();
            if(elem.selectionStart || elem.selectionStart) {
                elem.setSelectionRange(caretPos, caretPos);
            }
        }
    }
}

function setSelection(elem, startPos, endPos) {
    if(endPos < startPos) {
	temp = endPos;
	endPos = startPos;
	startPos = temp;
    }
    if(elem != null) {
        if(elem.createTextRange) { // Legacy IE
            var range = elem.createTextRange();
            range.moveStart('character', startPos);
	    range.moveEnd('character', endPos);
            range.select();
        } else {
	    elem.focus();
            if(elem.selectionStart || elem.selectionStart) {
                elem.setSelectionRange(startPos, endPos);
            }
        }
    }
}

function getCaretPosition(elem) {
    if (elem.selectionStart || elem.selectionStart == 0) {
	return elem.selectionStart;
    } else if (document.selection) { // Legacy IE
	elem.focus();
	var range = document.selection.createRange();
	range.moveStart ('character', -elem.value.length);
	return range.text.length;
    }

    return 0;
}

function getSelectionStart(elem) {
    if (elem.selectionStart || elem.selectionStart == 0) {
	return elem.selectionStart;
    } else if (document.selection) { // Legacy IE
	elem.focus();
	var range = document.selection.createRange();
	range.moveStart ('character', -elem.value.length);
	return range.text.length;
    }

    return 0;
}

function getSelectionEnd(elem) {
    if (elem.selectionEnd || elem.selectionEnd == 0) {
	return elem.selectionEnd;
    } else if (document.selection) { // Legacy IE
	elem.focus();
	var range = document.selection.createRange();
	var start = getSelectionStart(elem);
	return range.text.length + start;
    }

    return 0;
}

/* INITIALIZE */

box.onkeyup = function(){cursorChanged(false);};
box.onclick = function(){cursorChanged(false);};
document.getElementById("runbutton").onclick = run;
document.getElementById("pausebutton").onclick = pause;
document.getElementById("stopbutton").onclick = stop;
document.getElementById("stepbutton").onclick = step;
document.getElementById("speedselect").onchange = speedChange;

box.focus();
cursorChanged(true);
speedChange();
runStateChanged();
