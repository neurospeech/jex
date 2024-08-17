/* eslint-disable no-console */
import { SpawnOptionsWithoutStdio, spawn } from "node:child_process";

import { color } from "console-log-colors";

export const spawnPromise = (path, args?: string[], options?: SpawnOptionsWithoutStdio & {
    logCommand?: boolean,
    logData?: boolean,
    logError?: boolean,
    log?: (data: Buffer) => void,
    error?: (data: Buffer) => void,
    throwOnFail?: boolean }) => new Promise<{
    get all(): string;
    pid: number;
    status: number;
}>((resolve, reject) => {
    const all = [];
    const { logCommand = true, throwOnFail = false, logData = true, logError = true, log, error } = options ?? {};
    const cd = spawn(path, args, options);
    const pid = cd.pid;
    cd.stdout.on("data", (data) => {
        if (log) {
            log(data);
        }
        if (logData) {
            data = data.toString("utf8");
            all.push(data);
        }
    });
    cd.stderr.on("data", (data) => {
        if (error) {
            log(data);
        }
        if(logError) {
            data = data.toString("utf8");
            all.push(color.red(data));
        }
    });

    cd.on("error", (error) => {
        const errorText = color.red(error.stack ?? error.toString());
        all.push(error.stack ?? error.toString());
        if (logData || logError) {
            console.error(errorText);
        }
        reject(error);
    });
    cd.on("close", (status) => {
        if (status>0) {
            if (throwOnFail) {
                if (logError) {
                    console.error(all);
                }
                reject(new Error(all.join("\n")));
                return;
            }
        }
        if (logCommand) {
            console.log(`${path} ${args.join(" ")}`);
            if (logData) {
                console.log(all.join("\n"));
            }
        }
        resolve({
            get all() {
                return all.join("\n");
            },
            pid,
            status });
    });
});
