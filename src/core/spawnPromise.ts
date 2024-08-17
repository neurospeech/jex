/* eslint-disable no-console */
import { SpawnOptionsWithoutStdio, spawn } from "node:child_process";

import { color } from "console-log-colors";
import { Secret } from "./Secret.js";

export const spawnPromise = (path, args?: (string | Secret)[], options?: SpawnOptionsWithoutStdio & {
    logCommand?: boolean,
    logData?: boolean,
    logError?: boolean,
    log?: (data: Buffer) => void,
    error?: (data: Buffer) => void,
    throwOnFail?: boolean }) => new Promise<{
    get data(): Buffer[];
    get error(): string[];
    get text(): string;
    pid: number;
    status: number;
}>((resolve, reject) => {
    const dataList = [];
    const errorList = [];
    const allList = [];
    const { logCommand = true, throwOnFail = false, logData = true, logError = true, log, error } = options ?? {};
    const cd = spawn(path, args.map((x) => x instanceof Secret ? x.secret : x), options);
    const pid = cd.pid;
    if (logCommand) {
        console.log(`${path} ${args.join(" ")}`);
    }
    cd.stdout.on("data", (data) => {
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
