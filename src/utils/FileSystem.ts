import { copyFile, mkdir, readFile, unlink, writeFile } from "fs/promises";
import { homedir, userInfo } from "os";
import { join } from "path";
import {ITaskArgs, TaskArgs, ThenTaskArgs } from "../core/ITask.js";
import { existsSync } from "fs";

export interface IFileArg {
    path: string;
}

export const FileSystem = {

    expand(path: string) {
        return path.startsWith("~")
            ? `${homedir()}${path.substring(1)}`
            : path;
    },
  
    async Mkdir({ path }: TaskArgs<IFileArg> ) {
        path = FileSystem.expand(path);
        await mkdir( path, { recursive: true });
        console.log(`mkdir ${path}`);
    },

    async CopyFile({ src, dest }: TaskArgs<{ src: string, dest: string}> ) {
        src = FileSystem.expand(src);
        dest = FileSystem.expand(dest);
        await copyFile( src, dest);
        console.log(`Copied ${src} => ${dest}`);
    },

    async DeleteFile({ path}: TaskArgs<IFileArg>) {
        path = FileSystem.expand(path);
        await unlink(path);
        console.log(`File ${path} deleted.`);
    },

    async ReadJson({
        path,
        then
    }: ThenTaskArgs<IFileArg>) {
        path = FileSystem.expand(path);
        const text = await readFile(path, "utf8");
        await then?.(JSON.parse(text));
    },

    async WriteJson({
        path,
        json     
    }: TaskArgs<{ path: string, json: any}>) {
        path = FileSystem.expand(path);
        await writeFile(path, JSON.stringify(json, void 0, 2), "utf8");
        return json;
    },

    async MergeJson({
        path,
        json,
        then
    }: TaskArgs<{ path: string; json: any; }>) {
        path = FileSystem.expand(path);
        let existing = {};
        if (existsSync(path)) {
            const text = await readFile(path, "utf8");
            existing = JSON.parse(text);
        } else {
            existing = {};
        }
        if (json) {
            existing = mergeJson(existing, json);
        }
        await writeFile(path, JSON.stringify(existing, void 0, 2));
        await then?.(existing);
    }

};

const mergeJson = (src, target) => {
    src ??= {};
    for (const key in target) {
        if (Object.prototype.hasOwnProperty.call(target, key)) {
            const element = target[key];
            const srcEleemnt = src[key];
            if (srcEleemnt !== null && element !== null && typeof srcEleemnt === "object" && typeof element === "object") {
                mergeJson(srcEleemnt, element);
                continue;
            }
            src[key] = element;
        }
    }
    return src;
};