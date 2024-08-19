import XNode from "./XNode.js";

export default async function Batch({}, ... commands: (() => XNode | string)[]) {
    for (const iterator of commands) {
        let element = iterator as any;
        while (typeof element === "function") {
            element = element();
        }
        if (element?.execute) {
            await element.execute();
            continue;
        }

        // if (typeof element === "string") {
        //     const log = element.trim();
        //     if (log) {
        //         console.log(log);
        //     }
        // }

        
    }
}