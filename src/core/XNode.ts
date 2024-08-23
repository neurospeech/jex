import { isXNode } from "./isXNode.js";

export default class XNode {

    public static create(
        // eslint-disable-next-line @typescript-eslint/ban-types
        name: Function,
        attribs: Record<string, any>,
        ... nodes: (() => (XNode | string))[]): XNode {
        return new XNode(name, attribs, nodes);
    }

    private log = false;

    private constructor(
        public readonly name: Function,
        public readonly attributes: Record<string, any>,
        public readonly children: (() => (XNode | string))[]
    ) {
        this[isXNode] = true;
    }

    async execute() {
        const a = this.attributes ?? {};
        const { failed, throwOnFail = true} = a;
        let result;
        try {
            result = await this.___invoke(a);
            if (this.log) {
                console.log(`Executed ${this.name.name} at ${this.attributes?.location}`);
            }
        } catch (error) {
            failed?.(error);
            if (this.log) {
                console.log(`failed ${this.name.name} at ${this.attributes?.location}`);
            }
            if (throwOnFail) {
                throw new (Error as any)(`Failed ${this.name.name} on ${this.attributes?.location}`, { cause: error });
            }
        }
        return result;
    }

    private async ___invoke(a) {
        const result = this.name(a, ... this.children);
        if (result?.[isXNode]) {
            const ra = (result.attributes ??= {});
            ra.failed ??= a.failed;
            ra.throwOnFail ??= a.throwOnFail;
            result.log = this.log;
            ra.log ??= this.log;
            return await result.execute();
        }
        return result;
    }

}
