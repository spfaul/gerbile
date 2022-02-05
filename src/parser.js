import { TOK_TYPE } from "./lex.js";
import { compiler_error } from "./utils.js";
import assert from "assert";

const RAW_VALUES = new Set([TOK_TYPE.INT, TOK_TYPE.BOOL]);

export default function parse(toks) {
    let asm = "format ELF64 executable 3\n";
    let data = "segment readable writable\n" +
               "mem rb 100\n" + 
               "mem_ptr dq 0\n";

    let text =  "segment readable executable\n" +
                "entry main\n" +
                "include \"std/std.asm\"\n";

    let contexts = [];
    let identifiers = [];
    let return_addrs = [];
    let curr_func_def = null;
    let var_map;
    let var_offset = 0;
    let addr_count = 0;
    let str_lit_count = 0;
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
                    contexts.push(tok);
                    break;
                case TOK_TYPE.BRANCH_OPEN:
                    if (curr_func_def !== null) {
                        text += `addr_${addr_count++}:\n`;
                    }
                    contexts.push(tok);
                    break;
                case TOK_TYPE.DEF_CLOSE:
                    {
                        if (contexts.length == 0) compiler_error(tok.pos, "Unmatched parenthesis!");
                        let open = contexts.pop()
                        if (open.type !== TOK_TYPE.DEF_OPEN && open.type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, `Unmatched parenthesis, got ${open.type}`);
                        // Top-level function definition end
                        if (contexts.length == 0 && curr_func_def) {
                            curr_func_def = null;
                        }
                        // Return to main branch
                        if (return_addrs.length > 0 && open.type === TOK_TYPE.BRANCH_OPEN) {
                            text += `    jmp addr_${return_addrs.at(-1)}\n`;
                            if (open.val === "IF") {
                                text += `addr_${addr_count++}:\n`;
                            }
                        }
                    }
                    break;
                case TOK_TYPE.IF_CLOSE:
                    {
                        if (contexts.length == 0) compiler_error(tok.pos, "Unmatched parenthesis!");
                        let open = contexts.pop();
                        if (open.type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, `Unmatched parenthesis, got ${open.type}`);
                        if (open.val === "IF") text += `addr_${addr_count++}:\n`;
                        text += `    jmp addr_${return_addrs.at(-1)}\n` +
                                `addr_${return_addrs.pop()}:\n`;
                        break;
                    }
                case TOK_TYPE.FUNC_CALL:
                    {
                        line.unshift(tok);
                        let eval_data = eval_expr(line, var_offset, var_map, str_lit_count);
                        text += eval_data.text; data += eval_data.data; str_lit_count = eval_data.str_lit_count;
                        line.shift();
                        break;
                    }
                case TOK_TYPE.INT_TYPE:
                case TOK_TYPE.BOOL_TYPE:
                case TOK_TYPE.STRING_TYPE:
                    {
                        let iden = line.shift();
                        if (iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, `Expected identifier after type declaration \"${tok.type}\"`);
                        iden.val_type = tok.type;
                        identifiers.push(iden);
                    }
                    break;
                case TOK_TYPE.IDENTIFIER:
                    if (var_map.has(tok.val)) {
                        identifiers.push(Object.assign(tok, var_map.get(tok.val)));
                    } else {
                        console.log(tok);
                        compiler_error(tok.pos, `Unhandled identifier ${tok.val}`);
                    }
                    break;
                case TOK_TYPE.ASSIGN:
                    {
                        let iden = identifiers.pop();
                        let eval_data = eval_expr(line, var_offset, var_map, str_lit_count); // Get rest of line as expression 
                        text += eval_data.text; data += eval_data.data; str_lit_count = eval_data.str_lit_count;
                        line = [] // Trigger next iteration
                        text += "    mov rax, [mem_ptr]\n" +
                                `    add rax, ${var_map.has(iden.val) ? var_map.get(iden.val).start : var_offset}\n` +
                                "    pop rsi\n" +
                                `    mov qword[mem + rax], rsi\n`;
                        if (!var_map.has(iden.val)) {
                            if (!iden.val_type) compiler_error(tok.pos, `New variable \"${iden.val}\" must be declared with a type`);
                            var_map.set(iden.val, {start: var_offset, val_type: iden.val_type});
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
                    {
                        if (curr_func_def === null) compiler_error("Cannot return outside of function");
                        let eval_data = eval_expr(line, var_offset, var_map, str_lit_count);
                        text += eval_data.text; data += eval_data.data; str_lit_count = eval_data.str_lit_count;
                        if (curr_func_def === "main") {
                            text += "    mov rax, 60\n" +
                                    `    pop rdi\n` + 
                                    "    syscall\n";
                        } else {
                            text += "    pop rsi\n" +
                                    "    ret\n";
                        }
                    }
                    break;
                case TOK_TYPE.IF:
                    {
                        return_addrs.push(addr_count++);
                        let eval_data = eval_expr(line.splice(0, line.findIndex(t => t.type === TOK_TYPE.BRANCH_OPEN)),
                                                  var_offset,
                                                  var_map);
                        line[0].val = "IF";
                        text += eval_data.text; data += eval_data.data; str_lit_count = eval_data.str_lit_count;
                        text += "    mov rcx, 0\n" +
                                "    pop rsi\n" +
                                "    cmp rcx, rsi\n" +
                                `    jne addr_${addr_count}\n` +
                                `    jmp addr_${addr_count+1}\n`;
                    }
                    break;
                case TOK_TYPE.ELSE:
                    text += `    jmp addr_${addr_count}\n`;
                    break;
                case TOK_TYPE.ELSEIF:
                    {
                        let eval_data = eval_expr(line.splice(0, line.findIndex(t => t.type === TOK_TYPE.BRANCH_OPEN)),
                                                  var_offset,
                                                  var_map);
                        line[0].val = "IF";
                        text += eval_data.text; data += eval_data.data; str_lit_count = eval_data.str_lit_count;
                        text += "    mov rcx, 0\n" +
                                "    pop rsi\n" +
                                "    cmp rcx, rsi\n" +
                                `    jne addr_${addr_count}\n` +
                                `    jmp addr_${addr_count+1}\n`;
                    }
                    break;
            }
        }
        if (identifiers.length > 0) compiler_error(identifiers[0].pos, `Unhandled identifier \"${identifiers[0].val}\"`);
    }
    asm += text + data;
    return asm;
}

function atod(str) {
    let charCodeArray = [];
    for (let i=0; i<str.length; i++) {
        charCodeArray.push(str.charCodeAt(i));
    }
    return charCodeArray.join(", ");   
}

function eval_expr(expr_toks, var_offset, var_map, str_lit_count) {
    let text = "";
    let data = "";
    let rpn_ordered_toks = shunting_yard(expr_toks);
    let res_stack = [];
    
    for (let tok of rpn_ordered_toks) {
        if (RAW_VALUES.has(tok.type)) {
            res_stack.push(tok);
        } else if (tok.type === TOK_TYPE.STRING) {
            // if (line.length > 1 || line[0].type !== TOK_TYPE.STRING) compiler_error(tok.pos, "String on RHS of assignment must be standalone");
            data += `str_${str_lit_count}: db ${atod(tok.val)}, 0\n`;
            text += `    push str_${str_lit_count}\n`;
            str_lit_count += 1;
            var_offset += 8;
            res_stack.push({type: "REF"});           
        } else if (tok.type === TOK_TYPE.IDENTIFIER) {
            if (!var_map.has(tok.val)) compiler_error(tok.pos, `Referencing undeclared identifier ${tok.val}`);
            text += "    push rax\n" +
                    "    mov rax, [mem_ptr]\n" +
                    `    add rax, ${var_map.get(tok.val).start}\n` +
                    `    mov rsi, qword[mem + rax]\n` +
                    "    pop rax\n" +
                    "    push rsi\n";
            res_stack.push({type: "REF"});           
        } else if (tok.prec) { // Operator
            if (res_stack.length < 2) compiler_error(tok.pos, `Expected 2 operands for operator \"${tok.type}\"`);
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
                case TOK_TYPE.EQ:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmove rsi, rdi\n`;
                    break;
                case TOK_TYPE.GT:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmovg rsi, rdi\n`;
                    break;
                case TOK_TYPE.LT:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmovl rsi, rdi\n`;
                    break;
                case TOK_TYPE.GTOEQ:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmovge rsi, rdi\n`;
                    break;
                case TOK_TYPE.LTOEQ:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmovle rsi, rdi\n`;
                    break;
                case TOK_TYPE.NEQ:
                    text += "    cmp rsi, rdi\n" +
                            "    mov rsi, 0\n" +
                            "    mov rdi, 1\n" +
                            `    cmovne rsi, rdi\n`;
                    break;
            }
            text += "    push rsi\n";
            res_stack.push({type: "REF"});
        } else if (tok.type === TOK_TYPE.FUNC_CALL) {
            let func_call_var_offset = 0;
            let param_toks = [];
            text += `    add [mem_ptr], ${var_offset}\n`;
            while (res_stack.length && res_stack.at(-1).type !== TOK_TYPE.DEF_CLOSE) {
                param_toks.unshift(res_stack.pop());
            }
            res_stack.pop(); // Discard DEF_CLOSE
            for (let param_tok of param_toks) {
                text += "    mov rax, [mem_ptr]\n" +
                        `    add rax, ${func_call_var_offset}\n`;
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
        } else if (tok.type === TOK_TYPE.DEF_CLOSE) {
            res_stack.push(tok);
        }
    }
    if (res_stack.length > 1) compiler_error(res_stack.at(-1).pos, `Unexpected token in expression`);
    if (res_stack.length == 1 && RAW_VALUES.has(res_stack[0].type)) {
        text += `    mov rsi, ${res_stack[0].val}\n` +
                `    push rsi\n`;
    }
    
    return {text, data, str_lit_count};
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
        }  else if (RAW_VALUES.has(tok.type) || tok.type === TOK_TYPE.IDENTIFIER || tok.type === TOK_TYPE.STRING) {
            out_stack.push(tok);
        } else if (tok.type === TOK_TYPE.FUNC_CALL) {
            let iden = toks.shift();
            if (!iden || iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, "Expected identifier after keyword \"call\"");
            out_stack.push({type: TOK_TYPE.DEF_CLOSE, val: null}); // Signal the end of params
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

