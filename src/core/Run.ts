import { ISpawnResult, spawnPromise } from "./spawnPromise.js";
import XNode from "./XNode.js";

export interface IProcessResult {
    text: string;
    error: string[];
    data: Buffer[];
    pid: number;
    status: number;
}

export interface IRunArgs {
    cmd: string,
    args?: string | string[],
    cwd?: string,
    detached?: boolean,
    logCommand?: boolean,
    logData?: boolean,
    logError?: boolean,
    throwOnFail?: boolean,
    timeout?: number,
    log?: (data: Buffer) => void,
    error?: (data: Buffer) => void,
    started?: (pid: number) => void,
    then?: (r: IProcessResult) => void,
    failed?: (r: IProcessResult) => void

}

export default async function Run({
    cmd,
    args = void 0,
    cwd = void 0,
    detached = false,
    logCommand = true,
    logData = true,
    logError = true,
    throwOnFail = true,
    timeout = 30000,
    log = void 0 as (data: Buffer) => void,
    error = void 0 as (data: Buffer) => void,
    started = void 0 as (pid: number) => void,
    then = void 0 as (r: IProcessResult) => void,
    failed = void 0 as (r: IProcessResult) => void
}: IRunArgs) {

    if (typeof args === "string") {
        args = args.split(" ");
    }

    let r: ISpawnResult;

    try {
        r = await spawnPromise(cmd, args, {
            cwd,
            detached,
            logCommand,
            logData,
            logError,
            timeout,
            throwOnFail: false,
            log,
            error
        });
    } catch (err) {
        error?.(err);
        if (logError) {
            console.error(err.stack ?? err);
        }
        if (throwOnFail) {
            throw err;
        }
        return;
    }

    let fxr = void 0;

    if (r.status === 0) {
        fxr = then?.(r);
    } else {
        fxr = failed?.(r);
    }

    if (fxr) {
        await fxr;
    }

    if (r.status !== 0 && throwOnFail) {
        throw new Error(r.error.join("\n"));
    }
}