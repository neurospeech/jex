import { copyFile, mkdir, readdir, readFile, rm, unlink, writeFile } from "fs/promises";
import { homedir } from "os";
import {TaskArgs, ThenTaskArgs } from "../core/ITask.js";
import { existsSync } from "fs";
import { join, relative, resolve } from "path";
import TaskManager from "./Tasks.js";

export interface IFileArg {
    path: string;
}

export const FileSystem = {

    expand(path: string) {
        return path.startsWith("~")
            ? `${homedir()}${path.substring(1)}`
            : path;
    },

    async RemoveDir({
        path,
        force = false,
        recursive = false}: TaskArgs<{ path: string, force?: boolean, recursive?: boolean }>) {
        path = FileSystem.expand(path);
        console.log(`rm ${path} -rf`);
        await rm(path, {
            maxRetries: 3,
            retryDelay: 300,
            force,
            recursive
        });
    },
  
    async Mkdir({ path }: TaskArgs<IFileArg> ) {
        path = FileSystem.expand(path);
        console.log(`mkdir ${path}`);
        await mkdir( path, { recursive: true });
    },

    async CopyFolder({ src, dest }: TaskArgs<{ src: string, dest: string}> ) {
        src = FileSystem.expand(src);
        dest = FileSystem.expand(dest);
        console.log(`copy ${src} ${dest}`);
        const files = await readdir(src, { recursive: true, withFileTypes: true });
        await using tm = new TaskManager();
        for (const file of files) {
            const srcPath = join(file.parentPath, file.name);
            const relativePath = relative(srcPath, src);
            const destPath = resolve(dest, relativePath);
            tm.queueRun(() => copyFile(srcPath, destPath));
        }
    },

    async CopyFile({ src, dest }: TaskArgs<{ src: string, dest: string}> ) {
        src = FileSystem.expand(src);
        dest = FileSystem.expand(dest);
        console.log(`cp ${src} ${dest}`);
        await copyFile( src, dest);
    },

    async DeleteFile({ path}: TaskArgs<IFileArg>) {
        path = FileSystem.expand(path);
        console.log(`unlink ${path}`);
        await unlink(path);
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