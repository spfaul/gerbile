const WHITESPACE = ["\t", " ", "\n"];

export const TOK_TYPE = {
    FUNC: "FUNC",
    FUNC_CALL: "FUNC_CALL",
    DEF_OPEN: "DEF_OPEN",
    BRANCH_OPEN: "BRANCH_OPEN",
    DEF_CLOSE: "DEF_CLOSE",
    IF_CLOSE: "IF_CLOSE",
    PUSH: "PUSH",
    INT_TYPE: "INT_TYPE",
    BOOL_TYPE: "BOOL_TYPE",
    STRING_TYPE: "STRING_TYPE",
    TYPE_HINT: "TYPE_HINT",
    ASSIGN: "ASSIGN",
    INT: "INT",
    BOOL: "BOOL",
    STRING: "STRING",
    IDENTIFIER: "IDENTIFIER",
    LINEBREAK: "LINEBREAK",    
    RETURN: "RETURN",
    EQ: "EQ",
    IF: "IF",
    ELSEIF: "ELSEIF",
    ELSE: "ELSE",
    ADD: "ADD",
    SUB: "SUB",
    MULT: "MUL",
    DIV: "DIV",
    EQ: "EQ",
    GT: "GT",
    LT: "LT",
    GTOEQ: "GTOEQ",
    LTOEQ: "LTOEQ",
    NEQ: "NEQ",
    PARAM: "PARAM",
    COMMENT: "COMMENT"
}

export default function tokenize(text) {
    let toks = [];
    let curr_line_toks = [];
    let val = "";
    let curr_line = 1;
    let curr_char = 0;
    let in_str_lit = false;

    for (let idx=0; idx<text.length; idx++) {
        let c = text[idx];
        curr_char += 1;

        if (c == "\"" && (!val || in_str_lit)) {
            in_str_lit = !in_str_lit;
        }

        if (in_str_lit) {
            if (c == "\\") {
                let next_c = text[idx+1];
                if (next_c == "\\") {
                    idx++;
                } else if (next_c == "n") {
                    c = "\n";
                    idx++;
                } else if (next_c == "t") {
                    c = "\t";
                    idx++;
                }
            }
            val += c;
            continue;
        } else if (WHITESPACE.includes(c)) {
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
            if (curr_line_toks.length) {
                toks.push(curr_line_toks);
                curr_line_toks = [];
            }
            curr_line += 1;
            curr_char = 0;
        }
    }


    return toks;
}

// From: https://stackoverflow.com/questions/14636536/how-to-check-if-a-variable-is-an-integer-in-javascript
function isInt(str) {
    return !isNaN(str) && !isNaN(parseFloat(str));
}

function isBool(str) {
    return str === "yes" || str === "no";
}

function scanToken(text) {
    if (text[0] == "\"" && text[text.length - 1] == "\"") return {type: TOK_TYPE.STRING, val: text.slice(1, -1)};

    if (isInt(text)) return {type: TOK_TYPE.INT, val: parseInt(text)};

    if (isBool(text)) return {type: TOK_TYPE.BOOL, val: text === "yes" ? 1 : 0};

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
        case "bool":
            return {type: TOK_TYPE.BOOL_TYPE, val: null};
        case "str":
            return {type: TOK_TYPE.STRING_TYPE, val: null};
        case "~":
            return {type: TOK_TYPE.TYPE_HINT, val: null};
        case "=":
            return {type: TOK_TYPE.ASSIGN, val: null};
        case "ret":
            return {type: TOK_TYPE.RETURN, val: null};
        case "call":
            return {type: TOK_TYPE.FUNC_CALL, val: null};
        case "if":
            return {type: TOK_TYPE.IF, val: null};
        case "elif":
            return {type: TOK_TYPE.ELSEIF, val: null};
        case "else":
            return {type: TOK_TYPE.ELSE, val: null};
        case "endif":
            return {type: TOK_TYPE.IF_CLOSE, val: null};            
        case "^":
            return {type: TOK_TYPE.PUSH, val: null};
        case "add":
            return {type: TOK_TYPE.ADD, val: null, prec: 2}  
        case "sub":
            return {type: TOK_TYPE.SUB, val: null, prec: 2} 
        case "mul":
            return {type: TOK_TYPE.MULT, val: null, prec: 3} 
        case "div":
            return {type: TOK_TYPE.DIV, val: null, prec: 3} 
        case "==":
            return {type: TOK_TYPE.EQ, val: null, prec: 1};
        case ">":
            return {type: TOK_TYPE.GT, val: null, prec: 1}
        case "<":
            return {type: TOK_TYPE.LT, val: null, prec: 1}
        case "<=":
            return {type: TOK_TYPE.LTOEQ, val: null, prec: 1}
        case ">=":
            return {type: TOK_TYPE.GTOEQ, val: null, prec: 1}
        case "!=":
            return {type: TOK_TYPE.NEQ, val: null, prec: 1}
        case "dec":
            return {type: TOK_TYPE.PARAM, val: null}
        case "//":
            return {type: TOK_TYPE.COMMENT, val: null}
        default:
            return {type: TOK_TYPE.IDENTIFIER, val: text, val_type: null};
    }

}
