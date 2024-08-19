// load and execute script...

import { unlink, unlinkSync } from "fs";
import { Babel } from "./core/babel.js";
import XNode from "./core/XNode.js";
import { pathToFileURL } from "url";
import { Secret } from "./core/Secret.js";
import { cli } from "./core/CLI.js";

export { default as XNode } from "./core/XNode.js";

export { default as Batch } from "./core/Batch.js";

export { default as Run } from "./core/Run.js";

export { Prompt } from "./core/Prompt.js";


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

const deleteFile = false;

export const mask = (secret: string | Secret) => typeof secret !== "string" ? secret : new Secret(secret);

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

        const {default: fx} = await import(pathToFileURL(name).toString());

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
        if (!node.execute) {
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
        console.log(name);
        console.log(process.argv);
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

    cli.execute(process.argv);

    // // check passed script arguments...

    // // first arg will be the node
    // // second arg will be the jex runner script

    // // third arg onwards should be the batch that we would like to execute...
    // let [name] = process.argv;
    // if (name === "jex") {
    //     const [_, name, ... args] = process.argv;
    //     invoke(name, args).catch(console.error);
    // } else if (name) {
    //     const [_, _1, name, ... args] = process.argv;
    //     invoke(name, args).catch(console.error);
    // } else {
    //     console.log(`Usage: jex script-name.jsx ... args`);
    //     console.log(`Received: ${process.argv}`);
    // }

    
}