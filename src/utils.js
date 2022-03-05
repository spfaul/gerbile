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