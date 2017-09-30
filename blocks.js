
function contains(list, item) {
    return list.indexOf(item) != -1;
}

function ruleFirstToken(tokens) {
    return tokens.length == 0;
}

function ruleMoveDirection(tokens) {
    return contains(tokens, "move") &&
        !(contains(tokens, "forward") || contains(tokens, "backward"));
}

function ruleTurnDirection(tokens) {
    return contains(tokens, "turn") &&
        !(contains(tokens, "left") || contains(tokens, "right"));
}

function ruleColor(tokens) {
    return tokens[tokens.length - 1] == "color";
}

BLOCKS = [
    {
        "text": "move",
        "rule": ruleFirstToken
    },
    {
        "text": "forward ___ steps",
        "rule": ruleMoveDirection
    },
    {
        "text": "backward ___ steps",
        "rule": ruleMoveDirection
    },
    {
        "text": "turn",
        "rule": ruleFirstToken
    },
    {
        "text": "left ___ degrees",
        "rule": ruleTurnDirection
    },
    {
        "text": "right ___ degrees",
        "rule": ruleTurnDirection
    },
    {
        "text": "pen up",
        "rule": ruleFirstToken
    },
    {
        "text": "pen down",
        "rule": ruleFirstToken
    },
    {
        "text": "pen color",
        "rule": ruleFirstToken
    },
    {
        "text": "red",
        "rule": ruleColor
    },
    {
        "text": "orange",
        "rule": ruleColor
    },
    {
        "text": "yellow",
        "rule": ruleColor
    },
    {
        "text": "green",
        "rule": ruleColor
    },
    {
        "text": "blue",
        "rule": ruleColor
    },
    {
        "text": "purple",
        "rule": ruleColor
    },
    {
        "text": "white",
        "rule": ruleColor
    },
    {
        "text": "black",
        "rule": ruleColor
    },
    {
        "text": "gray",
        "rule": ruleColor
    },
    {
        "text": "brown",
        "rule": ruleColor
    }
];
