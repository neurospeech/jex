import { transform } from "@babel/core";
import { readFile, writeFile } from "fs/promises";
import { format, join, parse } from "path";

const presets = {
    sourceType: "module",
    sourceMaps: "inline",
    compact: false,
    comments: false,
    getModuleId: () => "v",
    "plugins": [
        ["@babel/plugin-syntax-jsx"],
        [
            function(babel) {
                return {
                    name: "JSX Transformer",
                    visitor: {
                        JSXElement(node) {
                            if (node.node.children?.length) {
                                const copy = [... node.node.children];
                                const transformed = node.node.children = [];
                                for (const element of copy) {
                                    switch(element.type) {
                                        case "JSXText":
                                            transformed.push(babel.types.arrowFunctionExpression([], babel.types.stringLiteral(element.value)));
                                            continue;
                                        case "JSXExpressionContainer":
                                            if (element.expression.type === "JSXEmptyExpression") {
                                                continue;
                                            }
                                            transformed.push(
                                                babel.types.arrowFunctionExpression(
                                                    [], babel.types.sequenceExpression([element.expression, babel.types.nullLiteral()])
                                                )
                                            );
                                            continue;
                                        case "JSXEmptyExpression":
                                            continue;
                                    }
                                    transformed.push(babel.types.arrowFunctionExpression([], element));
                                }
                            }
                            return node;
                        }
                    }
                };
            }
        ],
        ["@babel/plugin-transform-react-jsx", {
            pragma: "XNode.create",        
        }]

    ]
};
const root = join(import.meta.url.replaceAll("\\","/"), "..", "..","index.js" ).replaceAll("\\" ,"/");
const inject = `import { XNode } from "${ root}"`;

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