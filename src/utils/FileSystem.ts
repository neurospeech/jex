import { copyFile, mkdir } from "fs/promises";

export const FileSystem = {
    
    Mkdir({ path }) {
        return mkdir(path, { recursive: true });
    },

    CopyFile({ src, dest }) {
        return copyFile(src, dest);
    }

};