import { unlink, writeFile } from "fs/promises";
import Batch from "../../core/Batch.js";
import Run from "../../core/Run.js";
import { FileSystem } from "../../utils/FileSystem.js";

export interface IUploadApp {
    appPath: string;
    appType: "osx" | "ios" | "appletvos";
    apiKeyId: string;
    issuerId: string;
    apiPrivateKey: string;
}

export const XCRun = {

    UploadApp({
        appPath,
        appType,
        apiPrivateKey,
        apiKeyId,
        issuerId,
    }: IUploadApp) {

        const apiKey = FileSystem.expand(`~/private_keys/AuthKey_${apiKeyId}.p8`);

        const Install = async () => {
            await writeFile(apiKey, apiPrivateKey, "utf8");
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