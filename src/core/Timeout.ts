export class Timeout {
    private id;
    public signal: AbortSignal;
    private ac: AbortController;
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

