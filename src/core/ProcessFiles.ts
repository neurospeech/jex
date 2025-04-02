import { isXNode } from "./isXNode.js";
import { globIterate } from "glob";
import XNode from "./XNode.js";
import { Watcher } from "./Watcher.js";
import { stat } from "fs/promises";
import LocalFile from "./LocalFile.js";
import path from "path";


export default async function ProcessFiles({
    src,
    dest,
    cwd = process.cwd(),
    srcBase,
    command,
    appendExtension,
    replaceExtension,
    log = void 0,
    cleanup = void 0 as XNode
 }: {
    src: string,
    dest: string,
    cwd: string,
    srcBase: string,
    appendExtension?: string,
    replaceExtension?: string,
    command: ({ file, dest }: { file: LocalFile, dest: LocalFile}) => XNode | (() => XNode), cleanup?: XNode, log: any }) {

    try {

        let [_, root] = /^([^\*]+)/.exec(src);

        root = srcBase ?? root;

        Watcher.instance.watchFolder(root);

        const lm = Watcher.instance.lastRunTime;

        const baseDir = path.resolve(cwd, srcBase);
        const destDir = path.resolve(cwd, dest);

        for await (const file of globIterate(src, {
            absolute: true,
            cwd
        })) {

            if (lm) {
                const s = await stat(file);
                if(lm > s.ctime.getTime()) {
                    continue;
                }
            }   

            const inputFile = new LocalFile(file);


            let destFile = path.resolve(destDir, path.relative(file, baseDir));

            if (replaceExtension) {
                const i = destFile.lastIndexOf(".");
                if (i !== -1) {
                    destFile = destFile.substring(0, i) + replaceExtension;
                }
            }
            if (appendExtension) {
                destFile = destFile + appendExtension;
            }

            let element = await command({
                file: inputFile,
                dest: new LocalFile(destFile)
            }) as any;

            while (typeof element === "function") {
                element = element();
            }
            if (element?.[isXNode]) {
                element.log = log;
                try {
                    await element.execute();
                } catch (error) {
                    console.error(error.stack ?? error);
                }
                continue;
            }
        }
    } finally {
        if (cleanup) {
            await cleanup.execute();
        }
    }

}