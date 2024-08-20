/* eslint-disable no-console */
import { ChildProcess, SpawnOptionsWithoutStdio, spawn } from "node:child_process";

import cleanup from "node-cleanup";

import { color } from "console-log-colors";
import { Secret } from "./Secret.js";
import { Timeout } from "./Timeout.js";

export interface ISpawnArgs extends SpawnOptionsWithoutStdio {
    logCommand?: boolean,
    logData?: boolean,
    logError?: boolean,
    log?: (data: Buffer) => void,
    error?: (data: Buffer) => void,
    throwOnFail?: boolean
}


export interface ISpawnResult {
    get data(): Buffer[];
    get error(): string[];
    get text(): string;
    pid: number;
    status: number;
}

let running = new Set<ChildProcess>();

cleanup(() => {
    for (const element of running) {
        if (!element.killed) {
            try {
                element.kill();
            } catch {
                
            }
        }
    }
});

export const spawnPromise = (path, args?: (string | Secret)[], options: ISpawnArgs = {} ) =>
    new Promise<ISpawnResult>((resolve, reject) => {
    const dataList = [];
    const errorList = [];
    const allList = [];
    const { logCommand = true, throwOnFail = true, logData = true, logError = true, log, error, timeout = 30000 } = options;

    delete options.timeout;

    const timeout1 = new Timeout(timeout, options.signal);

    options.signal = timeout1.signal;


    const cd = spawn(path, args.map((x) => typeof x !== "string" ? x.secret : x.toString()), options);
    const pid = cd.pid;
    if (logCommand) {
        console.log(`${path} ${args.join(" ")}`);
    }

    running.add(cd);
    timeout1.signal.addEventListener("abort", () => {
        try {cd.kill(); } catch {}
    });

    cd.on("exit", () => {
        running.delete(cd);
        timeout1.dispose();
    });

    cd.stdout.on("data", (data) => {
        timeout1.reset();
        if (log) {
            log(data);
        }
        dataList.push(data);
        allList.push(data);
        if (logData) {
            console.log(data.toString("utf8"));
        }
    });
    cd.stderr.on("data", (data) => {
        timeout1.reset();
        allList.push(data);
        data = data.toString("utf8");
        if (error) {
            error(data);
        }
        errorList.push(data);
        if (logError) {
            console.error(data);
        }
    });

    cd.on("error", (error) => {
        const errorText = color.red(error.stack ?? error.toString());
        errorList.push(error.stack ?? error.toString());
        allList.push(error.stack ?? error.toString());
        if (logData || logError) {
            console.error(errorText);
        }
        reject(error);
    });
    cd.on("close", (status) => {
        if (status>0) {
            if (throwOnFail) {
                reject(new Error(errorList.join("\n")));
                return;
            }
        }
        resolve({
            get data() {
                return dataList;
            },
            get error() {
                return errorList;
            },
            get text() {
                return allList.map((x) => typeof x === "string" ? x : x.toString("utf8")).join("\n");
            },
            pid,
            status });
    });
});
