// load and execute script...

import { unlink, unlinkSync } from "fs";
import { Babel } from "./core/babel.js";
import XNode from "./core/XNode.js";
import { pathToFileURL } from "url";
import { Secret } from "./core/Secret.js";
import { cli } from "./core/CLI.js";
import { resolve } from "path";
import { isXNode } from "./core/isXNode.js";

export { default as XNode } from "./core/XNode.js";

export { default as Batch } from "./core/Batch.js";

export { default as Run } from "./core/Run.js";

export { Prompt } from "./core/Prompt.js";

export { default as readEnv } from "./core/readEnv.js";


// execute passed script...

export const Log = ({ text = void 0 , error = void 0 }) => {
    if (text) {
        if(Array.isArray(text)) {
            console.log(... text);
        } else {
            console.log(text);
        }
        return;
    }

    if (error) {
        if(Array.isArray(text)) {
            console.error(... text);
        } else {
            console.error(text);
        }
        return;
    }
};

const deleteFile = true;

export const mask = (secret: string | Secret | TemplateStringsArray, ... a ) => secret instanceof Secret
    ? secret
    : new Secret(secret, ... a);

export const invoke = async (name: string | XNode , args?: string[]) => {


    let js = "";

    try {
        if (typeof name !== "string") {
            return await name.execute();
        }
        if (name.endsWith(".jsx")) {
            js = await Babel.transformJSX(name);
            name = js;
        }

        // to absolute
        if (name.startsWith(".")) {
            name = resolve(name);
        }

        name = pathToFileURL(name).toString();

        console.log(`Loading ${name}`);
        const {default: fx} = await import(name);

        if (!fx) {
            // script must have executed automatically and may not have default export
            return;
        }
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
        if (!node[isXNode]) {
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
    } finally {
        if (js && deleteFile) {
            unlinkSync(js);
        }    
    }

}

if (process.argv.length) {


    cli.command("parse")
        .execute(async (fx, options, args) => {
            // parse file...
            for (const file of args) {
                await Babel.transform(file);
            }
        });

    cli.defaultCommand("invoke")
        .execute((fx, options, a) => {
            // get first arg
            const [ name, ... args] = a;
            return invoke(name, args);
        });

    cli.execute(process.argv).catch(console.error);
   
}