import { readFile } from "fs/promises";
import { ThenTaskArgs } from "../../core/ITask.js";

const pad = (d: number,digits = 2) => d.toString().padStart(digits, "0");

export const Build = {

    readEnv(name) {
        const v = process.env[name];
        if (v === void 0) {
            throw new Error(`Environment variable ${name} not set`)
        }
        return v;
    },

    async PrepareVersion({
        mode,
    }: ThenTaskArgs<{ mode: "patch" | "timestamp" }, { major, minor, patch, version, build }>) {

        const pkgFile = await readFile("./package.json", "utf8");
        const pkg = JSON.parse(pkgFile);
        const version = pkg.version as string;

        const [major, minor, patch] = version.split(".");

        const d = new Date();
        let build = `${pad(d.getFullYear(), 4)}${pad(d.getMonth() + 1)}${pad(d.getDay())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

        if (mode === "patch") {
            build = patch;
        }

        return {
            version,
            major,
            minor,
            patch,
            build
        };

    }

};