import { spawnPromise } from "./spawnPromise.js";
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
    log?: (data: Buffer) => void,
    error?: (data: Buffer) => void,
    started?: (pid: number) => void,
    finished?: (r: IProcessResult) => void,
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
    log = void 0 as (data: Buffer) => void,
    error = void 0 as (data: Buffer) => void,
    started = void 0 as (pid: number) => void,
    finished = void 0 as (r: IProcessResult) => void,
    failed = void 0 as (r: IProcessResult) => void
}: IRunArgs) {

    if (typeof args === "string") {
        args = args.split(" ");
    }

    const r = await spawnPromise(cmd, args, {
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