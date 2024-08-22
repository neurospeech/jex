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
        const r = this.name(a, ... this.children);
        if (r?.execute) {

            let result;

            // get then, failed and throwOnFail attributes...
            const { then, failed, throwOnFail = true} = a;
            if (failed || !throwOnFail) {
                try {
                    result = await r.execute();
                    await then?.(result);
                } catch (error) {
                    failed?.(error);
                    if (throwOnFail) {
                        throw error;
                    }
                }
                return result;
            }
            if (then) {
                result = await r.execute();
                await then(result);
                return result;
            }

            return await r.execute();
        }
        return r;
    }

}
