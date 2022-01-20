import { TOK_TYPE } from "./lex.js";

export default function parse(toks) {
	let asm = "format ELF64 executable 3\n";
	let data = "segment readable writable\n" +
	            "mem rb 100\n" + 
	            "mem_ptr dd 0";
	let text = "segment readable executable\n" +
			    "entry main\n";

	let contexts = [];
	let identifiers = [];
	let var_map = new Map();
	let var_offset = 0;
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
			case TOK_TYPE.INT_TYPE:
                identifiers.push(toks.shift());
			    break;
			case TOK_TYPE.ASSIGN:
			    let iden = identifiers.pop();
			    let value = toks.shift();
			    text += "    mov eax, [mem_ptr]\n" +
			            `    add eax, ${var_offset}\n` +
			            `    mov dword[mem + eax], ${value.val}\n`;
			    var_map.set(iden.val, {start: var_offset, size: 4});
			    var_offset += 4;
			    break;
			case TOK_TYPE.CLOSE:
				if (contexts.pop().type !== TOK_TYPE.OPEN) {
					throw new Error("Unmatching parenthesis!");
				}
				break;
			case TOK_TYPE.RETURN:
				if (contexts.at(-2).val === "main") {
					text += "    mov rax, 60\n" +
							`    mov rdi, ${toks[0].type == TOK_TYPE.INT ? toks[0].val : 69420}\n` + 
							"    syscall\n";
				} else {
                    // TODO: Handle Returned Values
					text += "    ret\n";
				}
				break;
		}
	}

	asm += text + data;
	return asm;
}