import { isXNode } from "./isXNode.js";

(Symbol as any).dispose ??= Symbol("dispose");
(Symbol as any).asyncDispose ??= Symbol("asyncDispose");

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
            if (this.log) {
                console.log(`Executing ${this.name.name} at ${this.attributes?.location}`);
                if(this.attributes) {
                    console.log(this.attributes);
                }
            }
            result = await this.___invoke(a);
            if (this.log) {
                console.log(`Executed ${this.name.name} at ${this.attributes?.location}`);
            }
        } catch (error) {
            failed?.(error);
            if (throwOnFail) {
                console.log(`failed ${this.name.name} at ${this.attributes?.location}`);
                console.error(error.stack ?? error);
                throw new (Error as any)(`Failed ${this.name.name} on ${this.attributes?.location}`, { cause: error.cause ?? error });
            }
        }
        return result;
    }

    private async ___invoke(a) {
        let then = a.then;
        if (then) {
            a.then = () => {
                const r1 = then();
                then = void 0;
                return r1;
            };
        }
        const result = this.name(a, ... this.children);
        if (result?.[isXNode]) {
            const ra = (result.attributes ??= {});
            ra.failed ??= a.failed;
            ra.throwOnFail ??= a.throwOnFail;
            result.log = this.log;
            ra.log ??= this.log;
            const r = await result.execute();
            const p = then?.(r);
            if (p?.then) {
                await p;
            }
        }
        return result;
    }

}
