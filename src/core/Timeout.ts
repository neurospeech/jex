export class Timeout {
    private id;
    public get signal() {
        return this.ac.signal;
    }
    private ac: AbortController = new AbortController();
    constructor(
        private readonly timeInMS,
        watchSignal?: AbortSignal
    ) {
        this.reset();
        watchSignal?.addEventListener("abort", () => this.ac.abort("aborted"));
    }

    reset() {
        if (this.id) {
            clearTimeout(this.id);
        }
        this.id = setTimeout(() => {
            this.ac.abort("timeout");
            this.id = null;
        }, this.timeInMS);
    }

    dispose() {
        if (this.id) {
            clearTimeout(this.id);
        }
    }
}

