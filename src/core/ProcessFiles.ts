import { isXNode } from "./isXNode.js";
import { globIterate } from "glob";
import XNode from "./XNode.js";


export default async function ProcessFiles({
    src,
    command,
    log = void 0,
    cleanup = void 0 as XNode
 }: { src: string, command: (file: string) => XNode | (() => XNode), cleanup?: XNode, log: any }) {

    try {
        for await (const file of globIterate(src)) {
            let element = await command(file) as any;
            while (typeof element === "function") {
                element = element();
            }
            if (element?.[isXNode]) {
                element.log = log;
                await element.execute();
                continue;
            }
        }
    } finally {
        if (cleanup) {
            await cleanup.execute();
        }
    }

}