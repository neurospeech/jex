// load and execute script...

import { unlinkSync } from "fs";
import { Babel } from "./core/babel.js";
import XNode from "./core/XNode.js";

export { default as XNode } from "./core/XNode.js";

export { default as Batch } from "./core/Batch.js";

export { default as Run } from "./core/Run.js";

// execute passed script...

export const invoke = async (name: string , args: string[]) => {
    let js = "";

    try {
        if (name.endsWith(".jsx")) {
            js = await Babel.transformJSX(name);
            name = js;
        }

        const {default: fx} = await import(name);
        const options: any = {
        };

        for (let index = 0; index < args.length; index++) {
            let element = args[index];
            let key = element;
            if (element.startsWith("--")) {
                element = element.substring(2);
                key = element;
                index++;
                options[key] = args[index];
            }
        }

        let node = fx;
        if (!(node instanceof XNode)) {
            node = fx(options);
        } else {
            for (const key in options) {
                if (Object.prototype.hasOwnProperty.call(options, key)) {
                    const element = options[key];
                    node.children[key] = element;
                }
            }
        }
        await node.execute();
    } catch (error) {
        console.error(error);
    }

    if (js) {
        unlinkSync(js);
    }

}

if (process.argv.length) {
    // check passed script arguments...

    // first arg will be the node
    // second arg will be the jex runner script

    // third arg onwards should be the batch that we would like to execute...
    const [program, script, ... args] = process.argv;

    
}