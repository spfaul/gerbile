const WHITESPACE = ["\t", " ", "\n"];

export const TOK_TYPE = {
	FUNC: "FUNC",
	DEF_OPEN: "DEF_OPEN",
	BRANCH_OPEN: "BRANCH_OPEN",
	DEF_CLOSE: "DEF_CLOSE",
	PUSH: "PUSH",
	INT_TYPE: "INT_TYPE",
	TYPE_HINT: "TYPE_HINT",
	ASSIGN: "ASSIGN",
	INT: "INT",
	IDENTIFIER: "IDENTIFIER",
	LINEBREAK: "LINEBREAK",	
	RETURN: "RETURN",
	EQ: "EQ",
	IF: "IF",
	ADD: "ADD"
}

export default function tokenize(text) {
	let toks = [];
	let curr_line_toks = [];
	let val = "";
	let curr_line = 0;
	let curr_char = 0;

	for (let idx=0; idx<text.length; idx++) {
        let c = text[idx];
        curr_char += 1;

		if (WHITESPACE.includes(c)) {
		    if (val) {
                let tok = scanToken(val);
                tok.pos = `${curr_line}:${curr_char - val.length}`;
                curr_line_toks.push(tok);
                val = "";
		    }
		} else if (idx == text.length - 1) {
		    val += c;
    	    let tok = scanToken(val);
            tok.pos = `${curr_line}:${curr_char - val.length + 1}`;
    		curr_line_toks.push(tok);
            toks.push(curr_line_toks);
		} else {
			val += c;
		}

        if (c === "\n") {
            toks.push(curr_line_toks);
            curr_line_toks = [];
            curr_line += 1;
            curr_char = 0;
        }
	}


	return toks;
}

// From: https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(str) {
	let x = parseFloat(str);
	return !isNaN(str) && (x | 0) === x;
}

function scanToken(text) {
	if (isInt(text)) {
		return {type: TOK_TYPE.INT, val: parseInt(text)};
	}

	switch (text) {
		case "proc":
			return {type: TOK_TYPE.FUNC, val: null};
		case "in":
			return {type: TOK_TYPE.DEF_OPEN, val: null};		
		case "do":
			return {type: TOK_TYPE.BRANCH_OPEN, val: null};
		case "end":
			return {type: TOK_TYPE.DEF_CLOSE, val: null};
		case "int":
			return {type: TOK_TYPE.INT_TYPE, val: null};
		case "~":
			return {type: TOK_TYPE.TYPE_HINT, val: null};
		case "=":
			return {type: TOK_TYPE.ASSIGN, val: null};
		case "ret":
			return {type: TOK_TYPE.RETURN, val: null};
        case "exec":
			return {type: TOK_TYPE.FUNC_CALL, val: null};
		case "is":
		    return {type: TOK_TYPE.EQ, val: null};
        case "if":
		    return {type: TOK_TYPE.IF, val: null};
        case "^":
            return {type: TOK_TYPE.PUSH, val: null};
        case "add":
            return {type: TOK_TYPE.ADD, val: null, prec: 1}  
		default:
			return {type: TOK_TYPE.IDENTIFIER, val: text};
	}

}
