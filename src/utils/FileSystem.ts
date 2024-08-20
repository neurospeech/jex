import { copyFile, mkdir } from "fs/promises";
import { homedir, userInfo } from "os";
import { join } from "path";

export const FileSystem = {

    expand(path: string) {
        return path.startsWith("~")
            ? `${homedir()}${path.substring(1)}`
            : path;
    },
  
    async Mkdir({ path }) {
        path = FileSystem.expand(path);
        await mkdir( path, { recursive: true });
        console.log(`mkdir ${path}`);
    },

    async CopyFile({ src, dest }) {
        src = FileSystem.expand(src);
        dest = FileSystem.expand(dest);
        await copyFile( src, dest);
        console.log(`Copied ${src} => ${dest}`);
    }

};