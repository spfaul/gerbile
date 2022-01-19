const WHITESPACE = ["\n", "\t", " "];

export const TOK_TYPE = {
	FUNC: "FUNC",
	OPEN: "OPEN",
	CLOSE: "CLOSE",
	INT_TYPE: "INT_TYPE",
	TYPE_HINT: "TYPE_HINT",
	ASSIGN: "ASSIGN",
	INT: "INT",
	IDENTIFIER: "IDENTIFIER",	
	RETURN: "RETURN"
}

export default function tokenize(text) {
	let toks = [];
	let val = "";

	for (let c of text) {
		if (WHITESPACE.includes(c)) {
			if (val) {
				toks.push(scanToken(val));
				val = "";
			}
		} else {
			val += c;
		}
	}

	if (val) {
		toks.push(scanToken(val));
	}

	return toks;
}

function token(type, val) {
	return {
		type: type,
		val: val
	}
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
			return {type: TOK_TYPE.OPEN, val: null};
		case "end":
			return {type: TOK_TYPE.CLOSE, val: null};
		case "int":
			return {type: TOK_TYPE.INT_TYPE, val: null};
		case "~":
			return {type: TOK_TYPE.TYPE_HINT, val: null};
		case "=":
			return {type: TOK_TYPE.ASSIGN, val: null};
		case "ret":
			return {type: TOK_TYPE.RETURN, val: null};
		default:
			return {type: TOK_TYPE.IDENTIFIER, val: text};
	}

}
