import process from "process";
import child_process from "child_process";

let error_count = 0;

export function run_command(command, args, opts) {
    let full_command = args.concat();
    full_command.unshift(command);
    console.log(`[CMD] ${full_command.join(" ")}`);
    let proc = child_process.spawnSync(command, args, {stdio: 'inherit'});
    if (opts && opts.code === true) {
        console.log(`[INFO] Command finished with exit code ${proc.status}`);
    }
    return proc.status
}

export function compiler_error(pos, msg) {
    console.log(`[ERROR] ${pos} - ${msg}`);
    process.exit(1);
}

const REGS = new Map([
    ["rax", ["eax", "ax", "al"]],
    ["rcx", ["ecx", "cx", "cl"]],
    ["rdx", ["edx", "dx", "dl"]],
    ["rbx", ["ebx", "bx", "bl"]],
    ["rsi", ["esi", "si", "sil"]],
    ["rdi", ["edi", "di", "dil"]],
    ["rsp", ["esp", "sp", "spl"]],
    ["rbp", ["ebp", "bp", "bpl"]],
    ["r8" , ["r8d", "r8w", "r8b"]],
    ["r9" , ["r9d", "r9w", "r9b"]],
    ["r10", ["r10d", "r10w", "r10b"]],
    ["r11", ["r11d", "r11w", "r11b"]],
    ["r12", ["r12d", "r12w", "r12b"]],
    ["r13", ["r13d", "r13w", "r13b"]],
    ["r14", ["r14d", "r14w", "r14b"]],
    ["r15", ["r15d", "r15w", "r15b"]]    
]);
export function get_subreg(reg, size) {
    if (!REGS.has(reg)) compiler_error("GET_SUBREG", `Unknown register name ${reg}`);
    if (size === 8) return reg;
    let subregs = REGS.get(reg);
    if (size === 1) return subregs[2];
    else if (size === 2) return subregs[1];
    else if (size === 4) return subregs[0];
    else compiler_error("GET_SUBREG", `Invalid size ${size}`);
}

export function atod(str) {
    let charCodeArray = [];
    for (let i=0; i<str.length; i++) {
        charCodeArray.push(str.charCodeAt(i));
    }
    return charCodeArray.join(", ");   
}
