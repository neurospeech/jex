import { spawnPromise } from "./spawnPromise.js";
import XNode from "./XNode.js";

export interface IProcessResult {
    all: string;
    pid: number;
    status: number;
}

export default async function Run({ path, args,
    cwd = void 0,
    detached = false,
    logCommand = true,
    logData = true,
    logError = true,
    log = void 0 as (data: Buffer) => void,
    error = void 0 as (data: Buffer) => void,
    started = void 0 as (pid: number) => void,
    finished = void 0 as (r: IProcessResult) => void,
    failed = void 0 as (r: IProcessResult) => void
}) {
    const r = await spawnPromise(path, args, {
        cwd,
        detached,
        logCommand,
        logData,
        logError,
        log,
        error
    });

    let fxr = void 0;

    if (r.status === 0) {
        fxr = finished?.(r);
    } else {
        fxr = failed?.(r);
    }

    if (fxr) {
        await fxr;
    }
}