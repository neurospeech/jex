import { existsSync, mkdirSync } from "fs";
import { writeFile } from "fs/promises";
import { dirname, parse } from "path";

const ensureDir = (path: string) => {
    if (existsSync(path)) {
        return;
    }
    const parent = dirname(path);
    ensureDir(parent);
    mkdirSync(path);
}


export default class LocalFile {

    public readonly baseName: string;
    public readonly dir: string;

    constructor(public readonly path: string) {
        const p = parse(this.path);
        this.baseName = p.base;
        this.dir = p.dir;
    }

    async write(data: Buffer | string, encoding?: BufferEncoding) {
        const dir = dirname(this.path);
        ensureDir(dir);

        return writeFile(this.path, data);
    }

}

