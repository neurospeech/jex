import { isXNode } from "./isXNode.js";
import { globIterate } from "glob";
import XNode from "./XNode.js";


export default async function ProcessFiles({
    src,
    dest,
    command,
    log = void 0,
    cleanup = void 0 as XNode
 }: { src: string, dest: string, command: ({ file, dest }: { file: string, dest: string}) => XNode | (() => XNode), cleanup?: XNode, log: any }) {

    try {

        let [_, root] = /^([^\*]+)/.exec(src);

        for await (const file of globIterate(src)) {

            const destFile = dest + file.substring(root.length);

            let element = await command({ file, dest: destFile }) as any;
            while (typeof element === "function") {
                element = element();
            }
            if (element?.[isXNode]) {
                element.log = log;
                try {
                    await element.execute();
                } catch (error) {
                    console.error(error.stack ?? error);
                }
                continue;
            }
        }
    } finally {
        if (cleanup) {
            await cleanup.execute();
        }
    }

}