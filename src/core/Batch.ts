import XNode from "./XNode.js";

export default async function Batch({
    cleanup = void 0 as XNode
}, ... commands: (() => XNode | string)[]) {

    try {
        for (const iterator of commands) {
            let element = iterator as any;
            while (typeof element === "function") {
                element = element();
            }
            if (element?.execute) {
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