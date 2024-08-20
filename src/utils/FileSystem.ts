import { copyFile, mkdir } from "fs/promises";
import { homedir, userInfo } from "os";
import { join } from "path";

export const FileSystem = {

    get userHomeDir() {
        return join(homedir(), userInfo().username);
    },

    expand(path: string) {
        return path.startsWith("~")
            ? `${FileSystem.userHomeDir}${path.substring(1)}`
            : path;
    },
  
    Mkdir({ path }) {
        return mkdir( FileSystem.expand(path), { recursive: true });
    },

    CopyFile({ src, dest }) {
        return copyFile( FileSystem.expand(src), FileSystem.expand(dest));
    }

};