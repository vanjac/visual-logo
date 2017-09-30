var WHITESPACE = ['\n', ' ', '\t'];

var box = document.getElementById("scriptbox");

var currentBlankSelectionStart = null;

function cursorChanged() {
    var pos = getCaretPosition(box);

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
        addBlocksAtCursor(pos);
    } else if(cursorOnCharacter(box.value, pos, WHITESPACE)) {
        currentBlankSelectionStart = null;
        addBlocksAtCursor(pos);
    } else {
        currentBlankSelectionStart = null;
        setBlocks([]);
    }
}

function addBlocksAtCursor(pos) {
    var lineBeforeCursor = box.value.substring(
        lineStart(box.value, pos), pos);
    tokensBeforeCursor = tokenize(lineBeforeCursor);
    console.log(tokensBeforeCursor);
    var matchedBlocks = [];
    for(var i = 0; i < BLOCKS.length; i++) {
        console.log(BLOCKS[i].text);
        if(BLOCKS[i].rule(tokensBeforeCursor))
            matchedBlocks.push(BLOCKS[i].text);
    }
    console.log(matchedBlocks);
    setBlocks(matchedBlocks);
}

function cursorOnCharacter(value, cursor, charSet) {
    return cursor == 0 || cursor == value.length ||
           charSet.indexOf(value.charAt(cursor)) != -1 ||
           charSet.indexOf(value.charAt(cursor-1)) != -1;
}

function lineStart(value, cursor) {
    var lastIndex = value.substring(0, cursor+1).lastIndexOf('\n');
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
            } else if(c != "_"){
                currentToken += c;
            }
        }
    }
    if(inString) {
        // add missing end quote
        tokens.push(currentToken + '"');
    }
    return tokens;
}

function setBlocks(blocks) {
    var blocksDiv = document.getElementById("blocks");
    var html = "";
    for(var i = 0; i < blocks.length; i++) {
        var name = blocks[i];
        html += "<a href=\"javascript:void(0)\" onclick='blockSelect(\"" +
            name +
            "\");'><span class=\"block\">" +
            name +
            "</span></a>";
    }
    blocksDiv.innerHTML = html;
}

function blockSelect(text) {
    var selStart = getSelectionStart(box);
    var selEnd = getSelectionEnd(box);
    if(WHITESPACE.indexOf(box.value.charAt(selStart - 1)) == -1)
        text = " " + text;
    if(WHITESPACE.indexOf(box.value.charAt(selEnd)) == -1)
        text += " ";
    box.value = box.value.substring(0, selStart) + text
        + box.value.substring(selEnd);
}


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
    console.log("Select from " + startPos + " to " + endPos);
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

box.onkeyup = cursorChanged;
box.onclick = cursorChanged;
