import tokenize from "./src/lex.js";
import parse from "./src/parser.js";
import { readFileSync, writeFileSync } from "fs";
import { run_command, get_error_count } from "./src/utils.js";
import process from "process";

let text = readFileSync("./test.gb", {encoding:'utf8', flag:'r'}, (err, data) => {
	if (err) console.error(err);
})
console.log(text);

let toks = tokenize(text);
console.log(toks);

let asm = parse(toks);
if (get_error_count() > 0) {
    console.log(`Got ${get_error_count()} errors, aborting...`);
    process.exit(1);
}
console.log(asm + "\n");

writeFileSync("./test.asm", asm, (err) => {
	if (err) console.error(err);
});

run_command("fasm ./test.asm");
run_command("./test", {code: true});
