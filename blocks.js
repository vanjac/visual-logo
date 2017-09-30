
function contains(list, item) {
    return list.indexOf(item) != -1;
}

BLOCKS = [
    {
        "text": "move",
        "rule": function(tokens) {
            return tokens.length == 0;
        }
    },
    {
        "text": "forward ___ steps",
        "rule": function(tokens) {
            return contains(tokens, "move") &&
                !(contains(tokens, "forward") || contains(tokens, "backward"));
        }
    },
    {
        "text": "backward ___ steps",
        "rule": function(tokens) {
            return contains(tokens, "move") &&
                !(contains(tokens, "forward") || contains(tokens, "backward"));
        }
    },
    {
        "text": "turn",
        "rule": function(tokens) {
            return tokens.length == 0;
        }
    },
    {
        "text": "left ___ degrees",
        "rule": function(tokens) {
            return contains(tokens, "turn") &&
                !(contains(tokens, "left") || contains(tokens, "right"));
        }
    },
    {
        "text": "right ___ degrees",
        "rule": function(tokens) {
            return contains(tokens, "turn") &&
                !(contains(tokens, "left") || contains(tokens, "right"));
        }
    }

];
