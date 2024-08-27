import { invoke, Batch, Run} from "@neurospeech/jex/index.js";
import { FileSystem } from "@neurospeech/jex/dist/utils/FileSystem.js";
import { AppleDev } from "@neurospeech/jex/dist/ci/mac/AppleDev.js";
import { Build } from "@neurospeech/jex/dist/ci/build/Build.js";
import { XCRun } from "@neurospeech/jex/dist/ci/mac/XCRun.js";
import assert from "assert";
import configs from "./build-ios.config.js";

let applicationDisplayVersion;
let applicationVersion;

const keyChainPath= "./kc1.db";

let signingIdentity;
let provisioningProfile;

for (const config of configs) {

    if (!config) {
        continue;
    }

    await invoke(<Batch
        cleanup={<Batch>
            <AppleDev.Clear
                keyChainPath={keyChainPath}
                provisioningProfile={config.provisioningProfileFile}
                />
        </Batch>}
        >


        <FileSystem.MergeJson
            json={({
                App: {
                    Url: config.url
                }
            })}
            path="./maui/DotWebApp/appsettings.json"
            />
            
        <Build.PrepareVersion
            mode={config.buildNumber}
            then={(x) => (applicationDisplayVersion = `${x.major}.${x.minor}`, applicationVersion = x.build)}
            />

        { assert(applicationDisplayVersion) }
        { assert(applicationVersion) }

        <AppleDev.InstallCert
            certPath={config.certPath}
            certPass={config.certPass}
            keyChainPath={keyChainPath}
            keyChainPass=""
            provisioningProfile={config.provisioningProfileFile}
            then={(r) => (signingIdentity = r.friendlyName, provisioningProfile = r.pp.name)}
            />

        { console.log(`Using identity ${signingIdentity}`)}
        { console.log(`Using profile ${provisioningProfile}`)}

        {/* <Run
            cmd="dotnet"
            args="nuget locals all --clear"
            /> */}

        <Run
            cmd="dotnet"
            timeout={300000}
            args="workload install maui"
            />

        <Run
            cmd="dotnet"
            timeout={300000}
            args="workload install android ios"
            />

        
        <Run
            cmd="dotnet"
            timeout={600000}
            logData={true}
            args={["publish",
                "-f", "net8.0-ios",
                "-c", "Release",            
                "/p:BuildIpa=true",
                "/p:RuntimeIdentifier=ios-arm64",
                `/p:ApplicationId=${config.id}`,
                `/p:ApplicationVersion=${applicationVersion}`,
                `/p:ApplicationDisplayVersion=${applicationDisplayVersion}`,
                `/p:CodesignKey=${signingIdentity}`,
                `/p:CodesignProvision=${provisioningProfile}`,
                "./maui/DotWebApp/DotWebApp.csproj"]}
            />
        

        <XCRun.UploadApp
            timeout={600000}
            appPath="./maui/DotWebApp/bin/Release/net8.0-ios/ios-arm64/publish/DotWebApp.ipa"
            appType="ios"
            apiKeyId={config.appStoreConnect.apiKeyId}
            issuerId={config.appStoreConnect.issuerId}
            apiPrivateKey={config.appStoreConnect.privateKey}
            />

    </Batch>);
}