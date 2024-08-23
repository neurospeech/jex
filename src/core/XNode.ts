export default class XNode {

    public static create(
        // eslint-disable-next-line @typescript-eslint/ban-types
        name: Function,
        attribs: Record<string, any>,
        ... nodes: (() => (XNode | string))[]): XNode {
        return new XNode(name, attribs, nodes);
    }

    private constructor(
        public readonly name: Function,
        public readonly attributes: Record<string, any>,
        public readonly children: (() => (XNode | string))[]
    ) {

    }

    async execute() {
        const a = this.attributes ?? {};
        a.throwOnFail ??= true;
        const { then, failed, throwOnFail} = a;
        let result;
        if (failed || !throwOnFail) {
            try {
                result = await this.___invoke(a);
                await then?.(result);
            } catch (error) {
                failed?.(error);
                if (throwOnFail) {
                    throw error;
                }
            }
            return result;
        }
        // get then, failed and throwOnFail attributes...
        if (then) {
            result = await this.___invoke(a);
            await then(result);
            return result;
        }
        return await this.___invoke(a);
    }

    private async ___invoke(a) {
        const result = this.name(a, ... this.children);
        if (result?.execute) {
            const ra = result.attributes ??= {};
            ra.then ??= a.then;
            ra.failed ??= a.failed;
            ra.throwOnFail ??= a.throwOnFail;
            return await result.execute();
        }
        return result;
    }

}
