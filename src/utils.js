import shelljs from "shelljs";

export function run_command(command, opts) {
    console.log(`[CMD] ${command}`);
    let proc = shelljs.exec(command);
    if (opts && opts.code === true) {
        console.log(`[INFO] Command finished with exit code ${proc.code}`);
    }
}
