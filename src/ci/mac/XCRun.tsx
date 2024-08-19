import Run from "../../core/Run.js";

export interface IUploadApp {
    appPath: string;
    appType: "osx" | "ios" | "appletvos";
    apiKeyId: string;
    issuerId: string;
}

export const XCRun = {

    UploadApp({
        appPath,
        appType,
        apiKeyId,
        issuerId,
    }: IUploadApp) {
        return <Run
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
    }

};