import EventEmitter from "node:events";
import { FSWatcher, watch } from "node:fs";

const sleep = (n) => new Promise(resolve => setTimeout(resolve, n));

export class Watcher {

    static instance = new Watcher();

    lastRunTime = 0;

    private fx: any;

    private lastRun;
    private isRunning;

    async watch(fx: () => any) {
        this.map = new Map();
        this.fx = fx;
        try {
            await this.runFx();
        } catch (error) {

        }

        while(true) {
            await sleep(10000);
        }
    }

    runFx() {
        const lastRun = this.lastRun;
        this.lastRun = (async () => {
            if (lastRun) {
                await lastRun;
            }
            try {
                await this.fx();
            } catch (error) {
                console.error(error.stack ?? error);
            }
            this.lastRunTime = Date.now();
            // console.log(`Last run time ${this.lastRunTime}`);
        })();
        return this.lastRun;
    }


    private map;

    private lastEmit;

    watchFolder(folder: string) {
        if (!this.map) {
            return;
        }
        if(this.map.has(folder)) {
            return;
        }
        console.log(`Watching: ${folder}`);
        const watcher = watch(folder, { recursive: true });
        this.map.set(folder, watcher);
        watcher.on("change", () => this.emitDelay());
        watcher.on("close", () => this.map.delete(folder));
    }

    private emitDelay() {
        if (this.isRunning) {
            return;
        }
        if (this.lastEmit) {
            clearTimeout(this.lastEmit);
            this.lastEmit = 0;
        }
        this.lastEmit = setTimeout(() => {
            this.runFx();
            this.lastEmit = 0;
        }, 1000);
    }

}