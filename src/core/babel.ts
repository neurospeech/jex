import { transformFileAsync } from "@babel/core";
import { writeFile } from "fs/promises";
import { format, parse } from "path";

const presets = {
    sourceType: "module",
    sourceMaps: "inline",
    compact: false,
    comments: false,
    importSource: "jex/dist/XNode.js",
    pragma: "XNode.create",
    getModuleId: () => "v",
    "plugins": [
    ]
};

export class Babel {


    static async transformJSX(file: string) {
        const result = await transformFileAsync(file, presets);
        const path = parse(file);
        path.base += ".js";
        const js = format(path);
        await writeFile(js, result.code, "utf8");
        return js;
    }

}