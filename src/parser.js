import tokenize, { TOK_TYPE, TYPE_TO_SIZE } from "./lex.js";
import { compiler_error, atod, get_subreg } from "./utils.js";
import path from "path";
import assert from "assert";
import { readFileSync } from "fs";

const RAW_VALUES = new Set([TOK_TYPE.INT, TOK_TYPE.BOOL]);
const TOP_LEVEL = new Set([TOK_TYPE.INCLUDE, TOK_TYPE.FUNC, TOK_TYPE.DEF_OPEN, TOK_TYPE.COMMENT]);
const SIZE_TO_DIRECTIVE = new Map([
    [1, "byte"],
    [8, "qword"]
]);

export default class Parser {
    constructor(proj_path) {
        this.proj_path = proj_path;
    }

    generate(toks, src_file_path) {
        this.data = "segment readable writable\n" +
                   "mem rb 600000\n" + 
                   "mem_ptr dq 0\n";
        this.text = "format ELF64 executable 3\n" +
                    "segment readable executable\n" +
                    "entry main\n" +
                    `include \"${path.relative(path.dirname(src_file_path), path.join(this.proj_path, "std/std.asm"))}\"\n`;
        this.included_files = new Set([path.normalize(src_file_path)]);
        this.addr_count = 0;
        this.str_lit_count = 0;
        this.memorys_count = 0;
        this.parse(toks, src_file_path);
        return this.text + this.data
    }

    parse(toks, src_file_path) {
        let contexts = [], identifiers = [], return_addrs = [];
        let curr_func_def = null;
        let var_map;
        let var_offset = 0;
        while (toks.length > 0) {
            let line = toks.shift();
            while (line.length > 0) {
                let tok = line.shift();
                if (curr_func_def == null && !TOP_LEVEL.has(tok.type)) compiler_error(tok.pos, "Keyword not allowed at top level!");
                switch (tok.type) {
                    case TOK_TYPE.INCLUDE:
                        {
                            let file_path_tok = line.shift();
                            if (file_path_tok === undefined || file_path_tok.type !== TOK_TYPE.STRING) compiler_error(tok.pos, "Invalid or missing include file path");
                            let file_path = path.relative(path.dirname(src_file_path), file_path_tok.val);
                            // Reserve paths for std library
                            if (file_path_tok.val === "std/std.gb") {
                                file_path = path.relative(path.resolve(), path.join(this.proj_path, file_path_tok.val));
                            }
                            if (this.included_files.has(file_path)) compiler_error(file_path_tok.pos, `\"${file_path_tok.val}\" has already been included`);
                            this.included_files.add(file_path) //  Avoid circular dependencies
                            let inc_text;
                            try {
                                inc_text = readFileSync(file_path, {encoding:"utf8", flag: "r"}, (err, data) => {
                                    if (err) compiler_error(file_path.pos, `Error while reading file at "${file_path_tok.val}": ${err}`);
                                });
                            } catch (err) {
                                if (err.code === "ENOENT") compiler_error(file_path_tok.pos, `File at "${file_path_tok.val}" does not exist`);
                                throw err;
                            }
                            let inc_toks = tokenize(file_path, inc_text);
                            this.parse(inc_toks, file_path);
                        }
                        break;
                    case TOK_TYPE.FUNC:
                        if (curr_func_def != null) compiler_error(tok.pos, "Cannot define subproc inside proc");
                        let func_name = line.shift();
                        if (func_name === undefined || func_name.type !== TOK_TYPE.IDENTIFIER) compiler_error("Invalid or missing function name");
                        this.text += `${func_name.val}:\n`;
                        curr_func_def = func_name.val;
                        var_map = new Map();
                        var_offset = 0;
                        break;
                    case TOK_TYPE.DEF_OPEN:
                        contexts.push(tok);
                        break;
                    case TOK_TYPE.BRANCH_OPEN:
                        if (curr_func_def !== null) {
                            this.text += `addr_${this.addr_count++}:\n`;
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
                                this.text += "    ret\n";
                                curr_func_def = null;
                            }
                            // Return to main branch from conditionals
                            if (return_addrs.length > 0 && open.type === TOK_TYPE.BRANCH_OPEN) {
                                this.text += `    jmp addr_${return_addrs.at(-1)}\n`;
                                if (open.val === "IF") {
                                    this.text += `addr_${this.addr_count++}:\n`;
                                } else if (open.val === "WHILE") {
                                    this.text += `    jmp addr_${return_addrs.pop()}\n` +
                                            `addr_${return_addrs.pop()}:\n`;
                                }
                            }
                        }
                        break;
                    case TOK_TYPE.IF_CLOSE:
                        {
                            if (contexts.length == 0) compiler_error(tok.pos, "Unmatched parenthesis!");
                            let open = contexts.pop();
                            if (open.type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, `Unmatched parenthesis, got ${open.type}`);
                            if (open.val === "IF") this.text += `addr_${this.addr_count++}:\n`;
                            this.text += `    jmp addr_${return_addrs.at(-1)}\n` +
                                    `addr_${return_addrs.pop()}:\n`;
                            break;
                        }
                    case TOK_TYPE.FUNC_CALL:
                        {
                            line.unshift(tok);
                            this.eval_expr(line, var_offset, var_map);
                            this.text += "    pop rsi\n";
                            line.shift();
                            break;
                        }
                    case TOK_TYPE.INT_TYPE:
                    case TOK_TYPE.BOOL_TYPE:
                    case TOK_TYPE.ADDR_TYPE:
                        {
                            let iden = line.shift();
                            if (iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, `Expected identifier after type declaration \"${tok.type}\"`);
                            iden.val_type = tok.type;
                            iden.size = TYPE_TO_SIZE.get(tok.type);
                            identifiers.push(iden);
                        }
                        break;
                    case TOK_TYPE.MEM_TYPE:
                        {
                            let iden = line.shift();
                            if (iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, `Expected identifier after type declaration \"${tok.type}\"`);
                            let size = line.shift();
                            if (size.type !== TOK_TYPE.INT) compiler_error(tok.pos, `Expected int after type declaration \"${tok.type}\"`);
                            this.data += `mem_${this.memorys_count}: rb ${size.val}\n`;
                            var_map.set(iden.val, {start: var_offset, val_type: tok.type, size: 8, mem_id: this.memorys_count});
                            this.memorys_count++;
                        }
                        break;
                    case TOK_TYPE.IDENTIFIER:
                        if (var_map.has(tok.val)) {
                            identifiers.push(Object.assign(tok, var_map.get(tok.val)));
                        } else {
                            compiler_error(tok.pos, `Undeclared identifier ${tok.val}`);
                        }
                        break;
                    case TOK_TYPE.ASSIGN:
                        {
                            let iden = identifiers.pop();
                            let iden_data = var_map.get(iden.val);
                            let mem_loc = var_map.has(iden.val) ? var_map.get(iden.val).start : var_offset;
                            this.eval_expr(line, var_offset, var_map); // Get rest of line as expression 
                            this.text += "    mov rax, [mem_ptr]\n" +
                                    "    pop rsi\n";
                            if (iden_data !== undefined && iden_data.val_type === TOK_TYPE.MEM_TYPE) {
                                this.text += `    mov ${SIZE_TO_DIRECTIVE.get(iden.size)}[mem_${iden_data.mem_id}], rsi\n`;
                            } else {
                                this.text += `    mov ${SIZE_TO_DIRECTIVE.get(iden.size)}[mem + rax + ${mem_loc}], ${get_subreg("rsi", iden.size)}\n`;
                            }
                            if (!var_map.has(iden.val)) {
                                if (iden.val_type === null) compiler_error(tok.pos, `New variable \"${iden.val}\" must be declared with a type`);
                                var_map.set(iden.val, {start: var_offset, val_type: iden.val_type, size: iden.size});
                                var_offset += iden.size;
                            }
                        }
                        break;
                    case TOK_TYPE.PARAM:
                        {  
                            while (identifiers.length > 0) {
                                let iden = identifiers.pop();
                                if (iden.val_type === null) compiler_error(tok.pos, `New variable \"${iden.val}\" must be declared with a type`);
                                var_map.set(iden.val, {start: var_offset, val_type: iden.val_type, size: iden.size});
                                var_offset += iden.size;
                            }
                        }
                        break;
                    case TOK_TYPE.RETURN:
                        {
                            if (curr_func_def === null) compiler_error("Cannot return outside of function");
                            this.eval_expr(line, var_offset, var_map);
                            if (curr_func_def === "main") {
                                this.text += "    mov rax, 60\n" +
                                        `    pop rdi\n` + 
                                        "    syscall\n";
                            } else {
                                this.text += "    pop rsi\n" + 
                                        "    ret\n";
                            }
                        }
                        break;
                    case TOK_TYPE.COMMENT:
                        line = [];
                        break;
                    case TOK_TYPE.IF:
                        {
                            return_addrs.push(this.addr_count++);
                            this.eval_expr(line.splice(0, line.findIndex(t => t.type === TOK_TYPE.BRANCH_OPEN)),
                                                      var_offset,
                                                      var_map);
                            line[0].val = "IF";
                            if (line[0].type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, "Expected 'do' for IF statement, found nothing");
                            this.text += "    mov rcx, 0\n" +
                                    "    pop rsi\n" +
                                    "    cmp rcx, rsi\n" +
                                    `    jne addr_${this.addr_count}\n` +
                                    `    jmp addr_${this.addr_count+1}\n`;
                        }
                        break;
                    case TOK_TYPE.ELSE:
                        if (line[0].type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, "Expected 'do' for ELSE statement, found nothing");
                        this.text += `    jmp addr_${this.addr_count}\n`;
                        break;
                    case TOK_TYPE.ELSEIF:
                        {
                            this.eval_expr(line.splice(0, line.findIndex(t => t.type === TOK_TYPE.BRANCH_OPEN)),
                                                      var_offset,
                                                      var_map);
                            if (line[0].type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, "Expected 'do' for ELSE IF statement, found nothing");
                            line[0].val = "IF";
                            this.text += "    mov rcx, 0\n" +
                                    "    pop rsi\n" +
                                    "    cmp rcx, rsi\n" +
                                    `    jne addr_${this.addr_count}\n` +
                                    `    jmp addr_${this.addr_count+1}\n`;
                        }
                        break;
                    case TOK_TYPE.WHILE:
                        {
                            return_addrs.push(this.addr_count+1); // return to this branch at end of loop
                            return_addrs.push(this.addr_count); // loop branch
                            this.text += `addr_${this.addr_count}:\n`
                            this.eval_expr(line.splice(0, line.findIndex(t => t.type === TOK_TYPE.BRANCH_OPEN)),
                                                      var_offset,
                                                      var_map);
                            this.text += "    mov rcx, 0\n" +
                                        "    pop rsi\n" +
                                        "    cmp rcx, rsi\n" +
                                        `    je addr_${this.addr_count+1}\n`;
                            if (line[0].type !== TOK_TYPE.BRANCH_OPEN) compiler_error(tok.pos, "Expected 'do' for LOOP statement, found nothing");                        
                            line[0].val = "WHILE";
                            this.addr_count += 2;
                        }
                        break;
                }
            }
            if (identifiers.length > 0) compiler_error(identifiers[0].pos, `Unhandled identifier \"${identifiers[0].val}\"`);
        }
    }
    
    eval_expr(expr_toks, var_offset, var_map) {
        let rpn_ordered_toks = this.shunting_yard(expr_toks);
        let res_stack = [];
        
        for (let tok of rpn_ordered_toks) {
            if (RAW_VALUES.has(tok.type)) {
                res_stack.push(tok);
            } else if (tok.type === TOK_TYPE.STRING) {
                this.data += `str_${this.str_lit_count}: db ${atod(tok.val)}, 0\n`;
                this.text += `    push str_${this.str_lit_count}\n`;
                this.str_lit_count++;
                var_offset += 8;
                res_stack.push({type: "REF", size: tok.size});           
            } else if (tok.type === TOK_TYPE.IDENTIFIER) {
                if (!var_map.has(tok.val)) compiler_error(tok.pos, `Referencing undeclared identifier ${tok.val}`);
                let iden = var_map.get(tok.val);
                if (iden.val_type === TOK_TYPE.MEM_TYPE) {
                    this.text += `    push mem_${iden.mem_id}\n`;
                    res_stack.push({type: "REF", name: tok.val, size: iden.size});           
                    continue;
                }
                this.text += "    mov rax, [mem_ptr]\n" +
                        `    mov ${get_subreg("rsi", iden.size)}, ${SIZE_TO_DIRECTIVE.get(iden.size)}[mem + rax + ${iden.start}]\n` +
                        "    push rsi\n";
                res_stack.push({type: "REF", name: tok.val, size: iden.size});
            } else if (tok.prec) { 
                // Operator
                if (res_stack.length < 2) compiler_error(tok.pos, `Expected 2 operands for operator \"${tok.type}\"`);
                let arg_b = res_stack.pop();
                let arg_a = res_stack.pop();
                let return_size;
                
                if (RAW_VALUES.has(arg_b.type)) this.text += `    mov rdi, ${arg_b.val}\n`;
                else if (arg_b.type === "REF") this.text += "    pop rdi\n";
                
                if (RAW_VALUES.has(arg_a.type)) this.text += `    mov rsi, ${arg_a.val}\n`;
                else if (arg_a.type === "REF") this.text += "    pop rsi\n";

                switch (tok.type) {
                    case TOK_TYPE.ADD:
                        this.text += "    add rsi, rdi\n";
                        return_size = 8;
                        break;
                    case TOK_TYPE.SUB:
                        this.text += "    sub rsi, rdi\n";
                        return_size = 8;
                        break;
                    case TOK_TYPE.MULT:
                        this.text += "    imul rsi, rdi\n";
                        return_size = 8;
                        break;
                    case TOK_TYPE.DIV:
                        this.text += "    push rax\n    push rdx\n" +
                                "    xor rdx, rdx\n" +
                                "    mov rax, rsi\n" +
                                "    idiv rdi\n" +
                                "    mov rsi, rax\n" +
                                "    pop rdx\n    pop rax\n";
                        return_size = 8;
                        break;
                    case TOK_TYPE.MOD:
                        this.text += "    push rax\n    push rdx\n" +
                                "    xor rdx, rdx\n" +
                                "    mov rax, rsi\n" +
                                "    idiv rdi\n" +
                                "    mov rsi, rdx\n" +
                                "    pop rdx\n    pop rax\n";
                        return_size = 8;                            
                        break;
                    case TOK_TYPE.EQ:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmove rsi, rdi\n`;
                        return_size = 1;
                        break;
                    case TOK_TYPE.GT:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmovg rsi, rdi\n`;
                        return_size = 1;
                        break;
                    case TOK_TYPE.LT:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmovl rsi, rdi\n`;
                        return_size = 1;
                        break;
                    case TOK_TYPE.GTOEQ:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmovge rsi, rdi\n`;
                        return_size = 1;
                        break;
                    case TOK_TYPE.LTOEQ:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmovle rsi, rdi\n`;
                        break;
                    case TOK_TYPE.NEQ:
                        this.text += "    cmp rsi, rdi\n" +
                                "    mov rsi, 0\n" +
                                "    mov rdi, 1\n" +
                                `    cmovne rsi, rdi\n`;
                        return_size = 1;
                        break;
                    case TOK_TYPE.AND:
                        this.text += "    and rsi, rdi\n";
                        return_size = 1;
                        break;
                    case TOK_TYPE.OR:
                        this.text += "    or rsi, rdi\n";
                        return_size = 1;
                        break;
                }
                this.text += "    push rsi\n";
                res_stack.push({type: "REF", size: return_size});
            } else if (tok.type === TOK_TYPE.FUNC_CALL) {
                let param_toks = [];
                this.text += `    add [mem_ptr], ${var_offset}\n`;
                while (res_stack.length && res_stack.at(-1).type !== TOK_TYPE.DEF_CLOSE) {
                    param_toks.push(res_stack.pop()); // b a
                }
                res_stack.pop(); // Discard DEF_CLOSE
                // Push args onto stack from nth to 1st arg
                let func_call_var_offset = 0;
                for (let i=1; i<param_toks.length; i++) {
                    func_call_var_offset += param_toks[i].size;
                }
                for (let param_tok of param_toks) {
                    this.text += "    mov rax, [mem_ptr]\n";
                    if (param_tok.type === "REF") {
                        this.text += "    pop rsi\n" +
                                `    mov ${SIZE_TO_DIRECTIVE.get(param_tok.size)}[mem + rax + ${func_call_var_offset}], ${get_subreg("rsi", param_tok.size)}\n`;
                    } else {
                        this.text += `    mov ${SIZE_TO_DIRECTIVE.get(param_tok.size)}[mem + rax + ${func_call_var_offset}], ${param_tok.val}\n`;
                    }
                    func_call_var_offset -= param_tok.size;
                }
                this.text += `    call ${tok.val}\n` +
                        `    sub [mem_ptr], ${var_offset}\n` +
                        "    push rsi\n";
                res_stack.push({type: "REF", size: 8}); // TODO: dynamic return value size
            } else if (tok.type === TOK_TYPE.DEF_CLOSE) {
                res_stack.push(tok);
            }
        }
        // TODO: do a seperate check of RPN toks beforehand
        if (res_stack.length > 1) compiler_error(res_stack.at(-1).pos, `Unexpected token in expression`);
        if (res_stack.length == 1 && RAW_VALUES.has(res_stack[0].type)) {
            this.text += `    mov rsi, ${res_stack[0].val}\n` +
                    `    push rsi\n`;
        }
    }

    shunting_yard(toks) {
        let out_stack = [];
        let op_stack = [];
        let tmp_stack;

        while (toks.length > 0) {
            let tok = toks.shift();

            if (RAW_VALUES.has(tok.type) || [TOK_TYPE.STRING, TOK_TYPE.IDENTIFIER, TOK_TYPE.PUSH, TOK_TYPE.POP].includes(tok.type)) {
                out_stack.push(tok);
            } else if (tok.prec) {
                while (op_stack.length > 0 && op_stack.at(-1).prec >= tok.prec) {
                    out_stack.push(op_stack.pop());               
                }
                op_stack.push(tok);
            } else if (tok.type === TOK_TYPE.FUNC_CALL) {
                let iden = toks.shift();
                if (!iden || iden.type !== TOK_TYPE.IDENTIFIER) compiler_error(tok.pos, "Expected identifier after keyword \"call\"");
                out_stack.push({type: TOK_TYPE.DEF_CLOSE, val: null}); // Signal the end of params
                op_stack.push({type: TOK_TYPE.DEF_OPEN, val: null});
                op_stack.push({type: TOK_TYPE.FUNC_CALL, val: iden.val}); // Dirty but works
            } else if (tok.type === TOK_TYPE.DEF_OPEN) {
                op_stack.push(tok);
            } else if (tok.type === TOK_TYPE.DEF_CLOSE) {
                // Prioritise pushing all ops within DEF_OPEN and DEF_CLOSE
                while (op_stack.length > 0 && op_stack.at(-1).type !== TOK_TYPE.DEF_OPEN) {
                    out_stack.push(op_stack.pop());
                }
                if (op_stack.length == 0) compiler_error(tok.pos, "Mismatched Parenthesis while parsing expression");
                op_stack.pop(); // Discard DEF_OPEN
            } else if (tok.type === TOK_TYPE.COMMENT) {
                toks.length = 0;
                break; 
            } else {
                compiler_error(tok.pos, `Unexpected type ${tok.type} while parsing expression`);
            }
        }
            
        op_stack.reverse();
        out_stack = out_stack.concat(op_stack);
        return out_stack;
    }
}