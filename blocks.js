
BLOCKS = [
    {
        "text": "move",
        "rule": function(tokens) {
            return tokens.length == 0;
        }
    },
    {
        "text": "abcde",
        "rule": function(tokens) {
            return true;
        }
    }

];
