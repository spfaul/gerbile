import tokenize from "./src/lex.js";
import parse from "./src/parser.js";
import { readFileSync, writeFileSync } from "fs";

let text = readFileSync("./test.ba", {encoding:'utf8', flag:'r'}, (err, data) => {
	if (err) console.error(err);
})

console.log(text);

let toks = tokenize(text);

console.log(toks);

let asm = parse(toks);

console.log(asm);

writeFileSync("./test.asm", asm, (err) => {
	if (err) console.error(err);
})