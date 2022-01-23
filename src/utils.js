import shelljs from "shelljs";

let error_count = 0;

export function run_command(command, opts) {
    console.log(`[CMD] ${command}`);
    let proc = shelljs.exec(command);
    if (opts && opts.code === true) {
        console.log(`[INFO] Command finished with exit code ${proc.code}`);
    }
}

export function compiler_error(tok, msg) {
    console.log(`[ERROR] ${tok.pos} - ${msg}`);
    error_count += 1;
}

export function get_error_count() {
    return error_count;
}
