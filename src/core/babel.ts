import { transform } from "@babel/core";
import { readFile, writeFile } from "fs/promises";
import { format, parse } from "path";

const presets = {
    sourceType: "module",
    sourceMaps: "inline",
    compact: false,
    comments: false,
    getModuleId: () => "v",
    "plugins": [
        // ["@babel/plugin-transform-react-jsx", {
        //     pragma: "XNode.create",        
        // }]
        ["@babel/plugin-syntax-jsx"],
        [
            function(babel, ... a) {
                console.log(babel);
                return {
                    name: "JSX Transformer",
                    visitor: {
                        JSXElement(node) {
                            console.log(node);
                        }
                    }
                };
            }
        ]
    ]
};
const inject = process.env.TEST_MODE
    ? `import { XNode } from "./dist/index.js"`
    : `import { XNode } from "@neurospeech/jex/dist/index.js"`;

export class Babel {


    static async transformJSX(file: string) {
        const code = await readFile(file, "utf8");
        const finalCode = `${inject};${code}`;
        const result = await transform(finalCode, presets);
        const path = parse(file);
        path.base += ".js";
        const js = format(path);
        await writeFile(js, result.code, "utf8");
        return js;
    }

}