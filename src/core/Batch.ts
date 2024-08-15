import XNode from "./XNode.js";

export default async function Batch({}, ... commands: XNode[]) {
    for (const element of commands) {
        await element.execute();
    }
}