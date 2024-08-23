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
    timeout = 30000,
    throwOnFail,
    log = void 0 as (data: Buffer) => void,
}: IRunArgs) {

    if (typeof args === "string") {
        args = args.split(" ");
    }

    return await spawnPromise(cmd, args, {
            cwd,
            detached,
            logCommand,
            logData,
            logError,
            timeout,
            throwOnFail,
            log
        });
}