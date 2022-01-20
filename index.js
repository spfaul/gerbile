import tokenize from "./src/lex.js";
import parse from "./src/parser.js";
import { readFileSync, writeFileSync } from "fs";
import { run_command } from "./src/utils.js";

let text = readFileSync("./test.gb", {encoding:'utf8', flag:'r'}, (err, data) => {
	if (err) console.error(err);
})
let toks = tokenize(text);
console.log(toks);

let asm = parse(toks);
console.log(asm + "\n\n");

writeFileSync("./test.asm", asm, (err) => {
	if (err) console.error(err);
});

run_command("fasm ./test.asm");
run_command("./test", {code: true});
