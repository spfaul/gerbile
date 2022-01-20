import { TOK_TYPE } from "./lex.js";
import assert from "assert";

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
			    if (toks[0].type === TOK_TYPE.IDENTIFIER) {
                    identifiers.push(toks.shift());
			    }
			    break;
			case TOK_TYPE.IDENTIFIER:
			    if (var_map.has(tok.val)) {
			        identifiers.push(tok);
			    }
			    break;
			case TOK_TYPE.ASSIGN:
			    let iden = identifiers.pop();
			    let value = toks.shift();
			    text += "    mov eax, [mem_ptr]\n" +
			            `    add eax, ${var_map.has(iden.val) ? var_map.get(iden.val).start : var_offset}\n` +
			            `    mov dword[mem + eax], ${value.val}\n`;
			    var_map.set(iden.val, {start: var_offset, size: 4});
			    var_offset += 4;
			    break;
			case TOK_TYPE.CLOSE:
			    let open = contexts.pop()
				if (open.type !== TOK_TYPE.FUNC) {
					throw new Error(`Unmatched parenthesis, got ${open.type}!`);
				}
				break;
			case TOK_TYPE.RETURN:
			    let popped = contexts.pop();
			    assert(popped !== undefined, "Stray Return!");
			    assert(popped.type === TOK_TYPE.OPEN, "Invalid Syntax!");
				if (contexts.at(-1).val === "main") {
					text += "    mov rax, 60\n" +
							`    mov rdi, ${toks[0].type == TOK_TYPE.INT ? toks[0].val : 69420}\n` + 
							"    syscall\n";
                    break;
				}
                if (toks[0].type === TOK_TYPE.INT) {
                    text += `    push ${toks.shift().val}\n`;
                }
	            text += "    ret\n";
				break;
		}
	}

	asm += text + data;
	return asm;
}