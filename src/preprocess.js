import { TOK_TYPE } from "./lex.js";
import { compiler_error } from "./utils.js";

export default class Preprocessor {
    process(toks) {
        this.mtable = new Map();
        toks = this.start(toks);
        console.log(toks)
        return toks
    }

    start(toks) {
        for (let i=0; i<toks.length; i++) {
            for (let j=0; j<toks[i].length; j++) {
                let tok = toks[i][j];
                switch (tok.type) {
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
