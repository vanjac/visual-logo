VOCAB = "move forward steps backward turn left degrees right pen up down color red orange yellow green blue purple white black gray brown repeat times end";
VOCAB = VOCAB.split(" ");

WIDTH = 512;
HEIGHT = 512;

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
    console.log(tokens);
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
