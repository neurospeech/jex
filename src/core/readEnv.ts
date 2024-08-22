/**
 * Reads the environment variable passed to this process, if it wasn't set,
 * it will use the default if provided, or else it will throw an error.
 * @param name name of environment variable
 * @param def default value if not supplied
 * @returns environment variable
 */
export default function readEnv(name: string, def = void 0) {
    const v = process.env[name] ?? def;
    if (v === void 0) {
        throw new Error(`Environment variable ${name} not set`)
    }
    return v;
}