import shelljs from "shelljs";
import process from "process";

let error_count = 0;

export function run_command(command, opts) {
    console.log(`[CMD] ${command}`);
    let proc = shelljs.exec(command);
    if (opts && opts.code === true) {
        console.log(`[INFO] Command finished with exit code ${proc.code}`);
    }
    return proc.code
}

export function compiler_error(pos, msg) {
    console.log(`[ERROR] ${pos} - ${msg}`);
    process.exit(1);
}