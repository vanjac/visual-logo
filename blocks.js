
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
        "text": "forward ___",
        "rule": function(tokens) {
            return contains(tokens, "move") &&
                !(contains(tokens, "forward") || contains(tokens, "backward"));
        }
    },
    {
        "text": "backward ___",
        "rule": function(tokens) {
            return contains(tokens, "move") &&
                !(contains(tokens, "forward") || contains(tokens, "backward"));
        }
    }

];
