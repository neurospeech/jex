import XNode from "./XNode.js";

export default async function Batch({}, ... commands: (() => XNode | string)[]) {
    for (const iterator of commands) {
        let element = iterator as any;
        if (typeof element === "function") {
            element = element();
        }
        if (element.execute) {
            await element.execute();
            continue;
        }
        if (typeof element === "string") {
            const log = element.trim();
            if (log) {
                console.log(log);
            }
        }

        // other text should be printed...?
    }
}