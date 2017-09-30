VOCAB = "move forward steps backward turn left degrees right pen up down color red orange yellow green blue purple white black gray brown repeat times end";
VOCAB = VOCAB.split(" ");

WIDTH = 512;
HEIGHT = 512;

GENERIC_COMMAND_ERROR = "Can't interpret command";

var ctx = document.getElementById("drawcanvas").getContext("2d");
var spriteCtx = document.getElementById("spritecanvas").getContext("2d");

var turtle = {
    "x": WIDTH/2,
    "y": HEIGHT/2,
    "heading": -Math.PI/2, // up
    "pen": false,
    "color": "black"
}

function runCommand(tokens) {
    if(tokens[0] == "move") {
        if(tokens.length == 1)
            return GENERIC_COMMAND_ERROR;
        return moveCommand(tokens.slice(1));
    }
    if(tokens[0] == "forward" || tokens[0] == "backward") {
        return moveCommand(tokens);
    }
    if(tokens[0] == "turn") {
        if(tokens.length == 1)
            return GENERIC_COMMAND_ERROR;
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
    if(tokens[0] == "up" || tokens[0] == "down" || tokens[0] == "color") {
        return penCommand(tokens.slice(0));
    }
    return GENERIC_COMMAND_ERROR;
}

function moveCommand(tokens) {
    if(tokens[0] != "forward" && tokens[0] != "backward")
        return GENERIC_COMMAND_ERROR;
    if(tokens.length == 1)
        return GENERIC_COMMAND_ERROR;
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
        return GENERIC_COMMAND_ERROR;
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
            return GENERIC_COMMAND_ERROR;
        turtle.color = tokens[1];
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

updateSprite();
