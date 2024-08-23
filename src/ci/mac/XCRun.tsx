import { mkdir, unlink, writeFile } from "fs/promises";
import Batch from "../../core/Batch.js";
import Run from "../../core/Run.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { join } from "path";
import { existsSync } from "fs";

export interface IUploadApp {
    appPath: string;
    appType: "osx" | "ios" | "appletvos";
    apiKeyId: string;
    issuerId: string;
    apiPrivateKey: string;
    timeout: number;
}

export const XCRun = {

    UploadApp({
        appPath,
        appType,
        apiPrivateKey,
        apiKeyId,
        issuerId,
        timeout = 300000,
    }: IUploadApp) {

        const privateKeys = join(process.env.HOME, "private_keys");

        const apiKey =  join(privateKeys, `AuthKey_${apiKeyId}.p8`);

        const Install = async () => {
            try {
                if (!existsSync(privateKeys)) {
                    await mkdir(privateKeys, { recursive: true });
                }
                await writeFile(apiKey, apiPrivateKey, "utf8");
            } catch (error) {
                console.error(error);
                throw new (Error as any)("Install failed", { cause: error });
            }
        };

        const Uninstall = async () => {
            await unlink(apiKey);
        };

return  <Batch
            cleanup={<Uninstall/>}
            >

            <Install
                />

            <Run
                cmd="xcrun"
                timeout={timeout}
                args={[
                    "altool",
                    "--output-format", "xml",
                    "--upload-app",
                    "--file", appPath,
                    "--type", appType,
                    "--apiKey", apiKeyId,
                    "--apiIssuer", issuerId
                ]}
            />
        </Batch>;
    }

};