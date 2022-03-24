import tokenize, { TOK_TYPE } from "./lex.js";
import { compiler_error } from "./utils.js";
import path from "path";
import { readFileSync } from "fs";

export default class Preprocessor {
    constructor(proj_path) {
        this.proj_path = proj_path;
    }

    process(toks, src_path) {
        this.mtable = new Map();
        this.included_files = new Set([src_path]);
        toks = this.start(toks);
        return toks
    }

    start(toks) {
        for (let i=0; i<toks.length; i++) {
            for (let j=0; j<toks[i].length; j++) {
                let tok = toks[i][j];
                switch (tok.type) {
                    case TOK_TYPE.INCLUDE:
                        {
                            let file_path_tok = toks[i][j+1];
                            if (file_path_tok === undefined || file_path_tok.type !== TOK_TYPE.STRING) compiler_error(tok.pos, "Invalid or missing include file path");
                            let file_path = path.relative(path.dirname(tok.file), file_path_tok.val);
                            // Reserve paths for std library
                            if (file_path_tok.val === "std/std.gb") {
                                file_path = path.relative(path.resolve(), path.join(this.proj_path, file_path_tok.val));
                            }
                            if (this.included_files.has(file_path)) compiler_error(file_path_tok.pos, `\"${file_path_tok.val}\" has already been included`);
                            this.included_files.add(file_path) //  Avoid circular dependencies
                            // Read text from file and tokenize it
                            let inc_text;
                            try {
                                inc_text = readFileSync(file_path, {encoding:"utf8", flag: "r"}, (err, data) => {
                                    if (err) compiler_error(file_path.pos, `Error while reading file at "${file_path_tok.val}": ${err}`);
                                });
                            } catch (err) {
                                // No file error doesn't get returned into the callback :)
                                if (err.code === "ENOENT") compiler_error(file_path_tok.pos, `File at "${file_path_tok.val}" does not exist`);
                                throw err;
                            }
                            let inc_toks = tokenize(file_path, inc_text);
                            toks.splice.apply(toks, [i+1, 0].concat(inc_toks));
                            // Trash include and include path tokens
                            toks[i].splice(j, 2);                            
                        }
                        break;                
                    case TOK_TYPE.MACRO:
                        {
                            let macro_name_tok = toks[i][j+1];
                            if (macro_name_tok === undefined || macro_name_tok.type !== TOK_TYPE.IDENTIFIER)
                                compiler_error(macro_name_tok.pos, `Macro name must be identifier, not ${macro_name_tok.type}`);
                            let macro_toks = toks[i].slice(j+2, toks[i].length); // Consume and clone all macro value tokens
                            toks[i] = []; // Destroy all macro value toks
                            this.mtable.set(macro_name_tok.val, {val: macro_toks});
                        }
                        break;
                    case TOK_TYPE.IDENTIFIER:
                        {
                            // If macro call, do token substitution
                            if (this.mtable.has(tok.val)) {
                                let macro = this.mtable.get(tok.val);
                                toks[i].splice(j, 1); // Trash macro call
                                toks[i].splice.apply(toks[i], [j, 0].concat(macro.val));
                                j--; // Compensate for trashed token index
                            }
                        }
                        break;
                }
            }
        }
        return toks;
    }
}
