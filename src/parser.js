import { TOK_TYPE } from "./lex.js";
import { compiler_error } from "./utils.js";
import assert from "assert";

const RAW_VALUES = new Set([TOK_TYPE.INT]);

export default function parse(toks) {
	let asm = "format ELF64 executable 3\n";
	let data = "segment readable writable\n" +
	            "mem rb 100\n" + 
	            "mem_ptr dq 0";
	let text = "segment readable executable\n" +
			    "entry main\n";

	let contexts = [];
	let identifiers = [];
	let return_addrs = [];
    let curr_func_def = null;
	let var_map;
	let var_offset = 0;
	let addr_count = 0;
	while (toks.length > 0) {
	    let line = toks.shift();
	    while (line.length > 0) {
    		let tok = line.shift();

    		switch (tok.type) {
    			case TOK_TYPE.FUNC:
    			    if (curr_func_def != null) compiler_error(tok.pos, "Cannot define subproc inside proc");
    				let func_name = line.shift();
    				text += `${func_name.val}:\n`;
                    curr_func_def = func_name.val;
                    var_map = new Map();
                    var_offset = 0;
    				break;
    			case TOK_TYPE.DEF_OPEN:
    				contexts.push({type: TOK_TYPE.DEF_OPEN, val: null});
    				break;
    			case TOK_TYPE.BRANCH_OPEN:
    			    if (curr_func_def !== null) {
                        text += `addr_${addr_count}:\n`;
                        addr_count += 1;			        
    			    }
    				contexts.push({type: TOK_TYPE.BRANCH_OPEN, val: null});
    			    break;
    			case TOK_TYPE.DEF_CLOSE:
    			    {
        			    assert(contexts.length > 0, "Unmatched parenthesis!");
        			    let open = contexts.pop()
        			    assert(open.type === TOK_TYPE.DEF_OPEN || open.type === TOK_TYPE.BRANCH_OPEN, `Unmatched parenthesis, got ${open.type}!`);
                        if (contexts.length == 0 && curr_func_def) {
                            // Top-level function definition end
                            curr_func_def = null;
                        }
        				if (return_addrs.length > 0) {
        				    // Return to main branch
        			        let gobacktothisaddr = return_addrs.pop()
        				    text += `    jmp addr_${gobacktothisaddr}\n` +
        				            `addr_${gobacktothisaddr}:\n`;
        				}
        			}
    				break;
    			case TOK_TYPE.FUNC_CALL:
                    line.unshift(tok);
                    text += eval_expr(line, var_offset);
                    line.shift();
                    break;
        		case TOK_TYPE.INT_TYPE:
    			    if (line[0].type === TOK_TYPE.IDENTIFIER) {
                        identifiers.push(line.shift());
    			    }
    			    break;
    			case TOK_TYPE.IDENTIFIER:
    			    if (var_map.has(tok.val)) {
    			        identifiers.push(tok);
    			    }
    			    break;
    			case TOK_TYPE.ASSIGN:
    			    {
        			    let iden = identifiers.pop();
        			    let eval_instructs = eval_expr(line, var_offset, var_map); // Get rest of line as expression 
        			    text += eval_instructs;
        			    line = [] // Trigger next iteration
        			    text += "    mov rax, [mem_ptr]\n" +
        			            `    add rax, ${var_map.has(iden.val) ? var_map.get(iden.val).start : var_offset}\n` +
        			            "    pop rsi\n" +
        			            `    mov qword[mem + rax], rsi\n`;
                        if (!var_map.has(iden.val)) {
            			    var_map.set(iden.val, {start: var_offset, size: 8});
            			    var_offset += 8;
                        }
                    }
    			    break;
    			case TOK_TYPE.PARAM:
    			    {  
        			    let iden = identifiers.pop();
                        var_map.set(iden.val, {start: var_offset, size: 8});
                        var_offset += 8;
                    }
    			    break;
    			case TOK_TYPE.RETURN:
    			    if (curr_func_def === null) compiler_error("Cannot return outside of function");
    				if (curr_func_def === "main") {
    					text += eval_expr(line, var_offset, var_map) + 
					            "    mov rax, 60\n" +
    							`    pop rdi\n` + 
    							"    syscall\n";
    				} else {
    				    text += eval_expr(line, var_offset, var_map) +
    				            "    pop rsi\n" +
                                "    ret\n";
    				}
    				break;
                case TOK_TYPE.IF:
                    {
                        let operand_a = line.shift();
                        let operator = line.shift();
                        let operand_b = line.shift();
        			    assert(operand_a.type == TOK_TYPE.IDENTIFIER || RAW_VALUES.has(operand_a.type), "Invalid operand type!");
        			    assert(operand_b.type == TOK_TYPE.IDENTIFIER || RAW_VALUES.has(operand_b.type), "Invalid operand type!");
                        // assert(operator.type == TOK_TYPE.EQ, "Invalid Operator!");
                        
                        if (operand_a.type == TOK_TYPE.IDENTIFIER) {
                            text += `    mov rax, [mem_ptr]\n` +
                                    `    add rax, ${var_map.get(operand_a.val).start}\n` +
                                    `    mov rdx, qword[mem + rax]\n`;
                        } else {
                            text += `    mov rdx, ${operand_a.val}\n`;
                        }
                        if (operand_b.type == TOK_TYPE.IDENTIFIER) {
                            text += "    mov rax, [mem_ptr]\n" +
                                    `    add rax, ${var_map.get(operand_b.val).start}\n` +
                                    `    mov rcx, qword[mem + rax]\n`;
                        } else {
                            text += `    mov rcx, ${operand_b.val}\n`;
                        }
                        return_addrs.push(addr_count);
                        text += `    cmp rdx, rcx\n`;
                        switch (operator.type) {
                            case TOK_TYPE.EQ:
                                text += `    je addr_${addr_count+1}\n`;
                                break;
                            case TOK_TYPE.GT:
                                text += `    jg addr_${addr_count+1}\n`;
                                break;
                            case TOK_TYPE.LT:
                                text += `    jle addr_${addr_count+1}\n`;
                                break;
                            case TOK_TYPE.GTOEQ:
                                text += `    jge addr_${addr_count+1}\n`
                                break;
                            case TOK_TYPE.LTOEQ:
                                text += `    jle addr_${addr_count+1}\n`;  
                                break;
                            case TOK_TYPE.NEQ:
                                text += `    jne addr_${addr_count+1}\n`;
                                break;
                        }
                        text += `    jmp addr_${addr_count}\n`;
                        addr_count += 1;
                    }
                    break;
    		}
	    }
	}
	asm += text + data;
	return asm;
}

function eval_expr(expr_toks, var_offset, var_map) {
    let text = "";
	let rpn_ordered_toks = shunting_yard(expr_toks);
	console.log(rpn_ordered_toks);
    let res_stack = [];
	
	for (let tok of rpn_ordered_toks) {
		if (RAW_VALUES.has(tok.type)) {
            res_stack.push(tok);
        } else if (tok.type === TOK_TYPE.IDENTIFIER) {
            if (!var_map.has(tok.val)) compiler_error(tok.pos, `Referencing undeclared identifier ${tok.val}`);
            text += "    push rax\n" +
                    "    mov rax, [mem_ptr]\n" +
                    `    add rax, ${var_map.get(tok.val).start}\n` +
                    "    mov rsi, qword[mem + rax]\n" +
                    "    pop rax\n" +
                    "    push rsi\n";
            res_stack.push({type: "REF"});
        } else if (tok.prec) { // Operator
            if (res_stack.length < 2) compiler_error(tok.pos, `Expected 2 operands for operator ${tok.type}`);
            let arg_b = res_stack.pop();
            let arg_a = res_stack.pop();
            if (RAW_VALUES.has(arg_a.type)) {
                text += `    mov rsi, ${arg_a.val}\n`;
            } else if (arg_a.type === "REF") {
                text += "    pop rsi\n";
            }
            if (RAW_VALUES.has(arg_b.type)) {
                text += `    mov rdi, ${arg_b.val}\n`;
            } else if (arg_b.type === "REF") {
                text += "    pop rdi\n";
            }
            switch (tok.type) {
                case TOK_TYPE.ADD:
                    text += "    add rsi, rdi\n";
                    break;
                case TOK_TYPE.SUB:
                    text += "    sub rsi, rdi\n";
                    break;
                case TOK_TYPE.MULT:
                    text += "    imul rsi, rdi\n";
                    break;
                case TOK_TYPE.DIV:
                    text += "    push rax\n    push rdx\n" +
                            "    mov rdx, 0\n" +
                            "    mov rax, rsi\n" +
                            "    idiv rdi\n" +
                            "    mov rsi, rax\n" +
                            "    pop rdx\n    pop rax\n";
                    break;
            }
            text += "    push rsi\n";
            res_stack.push({type: "REF"});
        } else if (tok.type === TOK_TYPE.FUNC_CALL) {
            let func_call_var_offset = 0;
		    text += `    add [mem_ptr], ${var_offset}\n`;
		    console.log(res_stack);
		    while (res_stack.length > 0) {
		        let param_tok = res_stack.pop();
                if (![TOK_TYPE.INT, TOK_TYPE.IDENTIFIER, "REF"].includes(param_tok.type)) {
                    compiler_error(`Unexpected parameter ${param_tok.type} in function call`)
                }
                text += "    mov rax, [mem_ptr]\n" +
                        `    add rax, ${func_call_var_offset}\n`
                if (param_tok.type === "REF") {
                    text += "    pop rsi\n" +
                            `    mov qword[mem + rax], rsi\n`;
                } else {
                    text += `    mov qword[mem + rax], ${param_tok.val}\n`;
                }
                func_call_var_offset += 8;
		    }
            res_stack.push({type: "REF"});
            text += `    call ${tok.val}\n` +
                    `    sub [mem_ptr], ${var_offset}\n` +
                    "    push rsi\n";
        }
	}
	if (res_stack.length > 1) compiler_error(res_stack.at(-1).pos, "Unexpected token in expression");
	if (res_stack.length == 1 && RAW_VALUES.has(res_stack[0].type)) {
	    text += `    mov rsi, ${res_stack[0].val}\n` +
	            `    push rsi\n`;
	}
	
	return text;
}

function shunting_yard(toks) {
	let out_stack = [];
	let op_stack = [];

	while (toks.length > 0) {
	    let tok = toks.shift();
        if (tok.prec) {
            while (op_stack.length > 0 && op_stack.at(-1).prec >= tok.prec) {
            	out_stack.push(op_stack.pop());		   	
          	}
          	op_stack.push(tok);
        }  else if (RAW_VALUES.has(tok.type) || tok.type === TOK_TYPE.IDENTIFIER) {
            out_stack.push(tok);
        } else if (tok.type === TOK_TYPE.FUNC_CALL) {
            let iden = toks.shift();
            if (!iden || iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, "Expected identifier after keyword \"exec\"");
            op_stack.push({type: TOK_TYPE.DEF_OPEN, val: null});
            op_stack.push({type: TOK_TYPE.FUNC_CALL, val: iden.val}); // Dirty but works
        } else if (tok.type === TOK_TYPE.DEF_OPEN) {
            op_stack.push(tok);
        } else if (tok.type === TOK_TYPE.DEF_CLOSE) {
            while (op_stack.length > 0 && op_stack.at(-1).type !== TOK_TYPE.DEF_OPEN) {
                // Prioritise pushing all ops within DEF_OPEN and DEF_CLOSE
                out_stack.push(op_stack.pop());
            }
            if (op_stack.length == 0) compiler_error(tok.pos, "Mismatched Parenthesis while parsing expression");
            op_stack.pop(); // Discard DEF_OPEN            
        } else {
            compiler_error(tok.pos, `Unexpected type ${tok.type} while parsing expression`);
        }
	}
	op_stack.reverse();
	out_stack = out_stack.concat(op_stack);
	return out_stack;
}

