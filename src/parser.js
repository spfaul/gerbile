import { TOK_TYPE } from "./lex.js";

export default function parse(toks) {
	let asm = "format ELF64 executable 3\n";
	let data = "segment readable writable\n";
	let text = "segment readable executable\n" +
			"entry main\n";

	let contexts = [];
	while (toks.length > 0) {
		let tok = toks.shift();

		switch (tok.type) {
			case TOK_TYPE.FUNC:
				let func_name = toks.shift();
				text += `${func_name.val}:\n`;
				contexts.push({type: TOK_TYPE.FUNC, val: func_name.val});
				break;
			case TOK_TYPE.OPEN:
				contexts.push({type: TOK_TYPE.OPEN, val: null});
				break;
			case TOK_TYPE.CLOSE:
				if (contexts.pop() !== TOK_TYPE.OPEN) {
					console.error("Unmatching parenthesis!");
				}
				break;
			case TOK_TYPE.RETURN:
				if (contexts.at(-2).val === "main") {
					text += "\tmov rax, 60\n" +
							"\tmov rdi, 0\n" + 
							"\tsyscall\n";
				} else {
					text += "\tret\n";	
				}
				break;
			default:
				// asd
		}
	}

	asm += text + data;
	return asm;
}