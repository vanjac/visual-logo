VOCAB = "move forward steps backward turn left degrees right pen up down color red orange yellow green blue purple white black gray brown size repeat times end";
VOCAB = VOCAB.split(" ");

WIDTH = 512;
HEIGHT = 512;

GENERIC_COMMAND_ERROR = "Can't interpret command";

var ctx = document.getElementById("drawcanvas").getContext("2d");
var spriteCtx = document.getElementById("spritecanvas").getContext("2d");

var turtle;

function runCommand(tokens) {
    if(tokens[0] == "end") {
        return "Unmatched end";
    }
    if(tokens.length == 1 && tokens[0].charAt(0) == '"') {
        // comment
        return;
    }
    if(tokens[0] == "move") {
        if(tokens.length == 1)
            return "Which direction to move, forward or backward?";
        return moveCommand(tokens.slice(1));
    }
    if(tokens[0] == "forward" || tokens[0] == "backward") {
        return moveCommand(tokens);
    }
    if(tokens[0] == "turn") {
        if(tokens.length == 1)
            return "Which direction to turn, left or right?";
        return turnCommand(tokens.slice(1));
    }
    if(tokens[0] == "left" || tokens[0] == "right") {
        return turnCommand(tokens);
    }
    if(tokens[0] == "pen") {
        if(tokens.length == 1)
            return GENERIC_COMMAND_ERROR;
        return penCommand(tokens.slice(1));
    }
    if(tokens[0] == "up" || tokens[0] == "down" || tokens[0] == "color" ||
       tokens[0] == "size") {
        return penCommand(tokens.slice(0));
    }
    if(tokens[0] == "repeat") {
        if(tokens.length == 1)
            return "How many times to repeat?";
        var times = tokens[1];
        if(isNaN(times))
            return times + " is not a number";
        return Number(times);
    }
    return GENERIC_COMMAND_ERROR;
}

function moveCommand(tokens) {
    if(tokens[0] != "forward" && tokens[0] != "backward")
        return GENERIC_COMMAND_ERROR;
    if(tokens.length == 1)
        return "How far to move?";
    var steps = tokens[1];
    if(isNaN(steps))
        return steps + " is not a number";
    steps = Number(steps);
    if(tokens[0] == "backward")
        steps = -steps;
    turtleMove(steps);
}

function turnCommand(tokens) {
    if(tokens[0] != "left" && tokens[0] != "right")
        return GENERIC_COMMAND_ERROR;
    if(tokens.length == 1)
        return "How much to turn?";
    var deg = tokens[1];
    if(isNaN(deg))
        return deg + " is not a number";
    deg = Number(deg);
    if(tokens[0] == "left")
        deg = -deg;
    turtleTurn(deg);
}

function penCommand(tokens) {
    if(tokens[0] == "up")
        turtle.pen = false;
    else if(tokens[0] == "down")
        turtle.pen = true;
    else if(tokens[0] == "color") {
        if(tokens.length == 1)
            return "What color?";
        var color = tokens[1];
        if(color.charAt(0) == '"')
            color = color.substring(1, color.length-1);
        turtle.color = color;
    } else if(tokens[0] == "size") {
        if(tokens.length == 1)
            return "What size? (please give a number)";
        var size = tokens[1];
        if(isNaN(size))
            return size + " is not a number";
        turtle.size = Number(size);
    } else
        return GENERIC_COMMAND_ERROR;
}

function updateSprite() {
    spriteCtx.clearRect(0, 0, WIDTH, HEIGHT);
    spriteCtx.strokeStyle = "blue";
    spriteCtx.fillStyle = "blue";
    spriteCtx.beginPath();
    spriteCtx.arc(turtle.x, turtle.y, 6, 2*Math.PI, false);
    spriteCtx.fill();

    spriteCtx.beginPath();
    spriteCtx.moveTo(turtle.x, turtle.y);
    spriteCtx.lineTo(turtle.x + Math.cos(turtle.heading) * 30,
                     turtle.y + Math.sin(turtle.heading) * 30);
    spriteCtx.stroke();
}

function turtleMove(steps) {
    var oldX = turtle.x;
    var oldY = turtle.y;
    turtle.x += Math.cos(turtle.heading) * steps;
    turtle.y += Math.sin(turtle.heading) * steps;
    if(turtle.pen) {
        ctx.strokeStyle = turtle.color;
        ctx.lineWidth = turtle.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(oldX, oldY);
        ctx.lineTo(turtle.x, turtle.y);
        ctx.stroke();
    }
    updateSprite();
}

function turtleTurn(degCW) {
    turtle.heading += degCW * Math.PI / 180;
    updateSprite();
}

function clear() {
    turtle = {
        "x": WIDTH/2,
        "y": HEIGHT/2,
        "heading": -Math.PI/2, // up
        "pen": true,
        "color": "black",
        "size": 1
    }
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    updateSprite();
}

document.getElementById("resetbutton").onclick = clear;

clear();
