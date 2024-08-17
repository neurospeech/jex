import XNode from "./XNode.js";

export default async function Batch({}, ... commands: XNode[]) {
    for (const element of commands) {
        if (element instanceof XNode) {
            await element.execute();
            continue;
        }

        // other text should be printed...?
    }
}