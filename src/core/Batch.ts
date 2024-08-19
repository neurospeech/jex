import XNode from "./XNode.js";

export default async function Batch({}, ... commands: (() => XNode | string)[]) {
    for (const iterator of commands) {
        let element = iterator as any;
        if (typeof element === "function") {
            element = element();
        }
        if (element?.execute) {
            await element.execute();
            continue;
        }

        // we will ignore any other type of nodes
        console.log("");
    }
}