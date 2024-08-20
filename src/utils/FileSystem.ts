import { copyFile, mkdir } from "fs/promises";
import { homedir, userInfo } from "os";
import { join } from "path";

export const FileSystem = {

    get userHomeDir() {
        return join(homedir(), userInfo().username);
    },

    expand(path: string) {
        return path.startsWith("~")
            ? `${this.userHomeDir}${path.substring(1)}`
            : path;
    },
  
    Mkdir({ path }) {
        return mkdir( this.expand(path), { recursive: true });
    },

    CopyFile({ src, dest }) {
        return copyFile( this.expand(src), this.expand(dest));
    }

};