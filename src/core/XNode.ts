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
        const r = this.name(this.attributes ?? {}, ... this.children);
        if (r instanceof XNode) {
            return r.execute();
        }
        return r;
    }

}
