import { transform } from "@babel/core";
import { existsSync, statSync } from "fs";
import { readdir, readFile, writeFile } from "fs/promises";
import { dirname, format, join, parse, resolve } from "path";

const presets = {
    sourceType: "module",
    sourceMaps: "inline" as any,
    inputSourceMap: true,
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
                        ImportDeclaration(node) {
                            const e = node.node;
                            const source = e.source?.value;
                            if (source?.endsWith(".jsx")) {
                                // resolve...
                                if (source?.startsWith(".")) {
                                    const targetFile = resolve(Babel.cwd, source);
                                    const jsFile = targetFile.substring(0, targetFile.length - 1);
                                    const  hasJS = existsSync(jsFile);
                                    if (hasJS) {
                                        e.source.value = jsFile;
                                        return node;
                                    }
                                    Babel.pending.push(targetFile);
                                }
                                // e.source.value = source.substring(0, source.length-1);
                                e.source.value = e.source.value + ".mjs";
                            }
                            return node;
                        },
                        JSXElement(node, state) {
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

                                    // lets add location...
                                    if (element.loc?.start) {
                                        (element.openingElement.attributes ??= []).push(
                                            babel.types.jsxAttribute(
                                                babel.types.jsxIdentifier("location"),
                                                babel.types.stringLiteral( `${element.loc.filename ?? state.filename} ${element.loc.start.line},${element.loc.start.column}`))
                                        );
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
// const inject = `import XNode from "@neurospeech/jex/dist/core/XNode.js"`;

const root = process.env.TEST_MODE
    ? join(import.meta.url.replaceAll("\\","/"), "..", "XNode.js" ).replaceAll("\\" ,"/")
    : "@neurospeech/jex/dist/core/XNode.js";
const inject = `import XNode from "${ root}"`;


export class Babel {

    static pending = [];
    static done = new Set<string>();

    static cwd: string;

    static async transformJSX(file: string, outputFile?: string) {
        Babel.cwd = dirname(file);
        Babel.done.add(file);
        let code = await readFile(file, "utf8");
        const finalCode = `${inject};${code}`;
        const p = { ... presets, filename: file };
        if (outputFile) {
            p.sourceMaps = true;
        }
        const result = await transform(finalCode, p);
        if (!outputFile) {
            let path = parse(file);
            path.base += ".mjs";
            const js = format(path);
            outputFile = js;
            await writeFile(outputFile, result.code, "utf8");
        } else {
            await writeFile(outputFile, result.code, "utf8");
            await writeFile(outputFile + ".map", JSON.stringify(result.map), "utf8");
        }
        return outputFile;
    }

    static async transform(fileOrFolder: string) {
        const s = statSync(fileOrFolder);
        if(s.isDirectory()) {
            const files = await readdir(fileOrFolder, { withFileTypes: true });
            for (const iterator of files) {
                const file = join(fileOrFolder, iterator.name);
                await this.transform(file);
            }
            return;
        }
        if (!fileOrFolder.endsWith(".jsx")) {
            return;
        }
        const path = parse(fileOrFolder);
        const output = fileOrFolder.replace(path.base, path.name + ".js");
        console.log(`Transforming ${fileOrFolder} to ${output}`);
        return await this.transformJSX(fileOrFolder, output);
    }

}