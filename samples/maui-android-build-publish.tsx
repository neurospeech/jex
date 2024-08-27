import { invoke, Batch, Run, mask } from "@neurospeech/jex/index.js";
import { FileSystem } from "@neurospeech/jex/dist/utils/FileSystem.js";
import { PlayStore } from "@neurospeech/jex/dist/ci/android/PlayStore.js";
import { Build } from "@neurospeech/jex/dist/ci/build/Build.js";
import assert from "assert";


import configs from "./maui-android.config.js";

let applicationDisplayVersion;
let applicationVersion;

for(const config of configs) {

    if (!config) {
        continue;
    }

    await invoke(<Batch>

        {/* <Run
            cmd="dotnet"
            throwOnFail={false}
            args="nuget locals all --clear"
            /> */}

        <Build.PrepareVersion
            mode={config.buildNumber}
            then={(x) => (applicationDisplayVersion = `${x.major}.${x.minor}`, applicationVersion = x.build)}
            />

        <FileSystem.MergeJson
            json={({
                App: {
                    Url: config.url
                }
            })}
            path="./maui/DotWebApp/appsettings.json"
            />

        { assert(applicationDisplayVersion) }
        { assert(applicationVersion) }

        <Run
            cmd="dotnet"
            timeout={300000}
            args="workload install maui"
            />

        <Run
            cmd="dotnet"
            timeout={300000}
            args="workload install android"
            />

        
        <Run
            cmd="dotnet"
            timeout={240000}
            logData={true}
            args={["publish",
                "-f", config.targetFramework,
                "-c", "Release",
                `/p:ApplicationId=${config.id}`,
                `/p:ApplicationTitle=${config.name}`,
                `/p:ApplicationVersion=${applicationVersion}`,
                `/p:ApplicationDisplayVersion=${applicationDisplayVersion}`,
                "/p:AndroidKeyStore=true",
                `/p:AndroidSigningKeyAlias=${config.androidSigningKeyAlias}`,
                `/p:AndroidSigningKeyStore=${config.androidKeyStore}`,
                mask `/p:AndroidSigningStorePass=${config.androidKeyStorePassword}`,
                mask `/p:AndroidSigningKeyPass=${config.androidKeyStorePassword}`,
                config.androidSdkRoot ? `/p:AndroidSdkPath=${config.androidSdkRoot}` : void 0,
                config.javaHome ? `/p:JavaSdkDirectory=${config.javaHome}`: void 0,
                "./maui/DotWebApp/DotWebApp.csproj"]}
            />

        { config.publish && <PlayStore.Upload
            packageName={config.id}
            releaseFiles={[`./maui/DotWebApp/bin/Release/${config.targetFramework}/publish/*-Signed.apk`]}
            serviceAccountJsonRaw={config.serviceAccountJsonRaw}
            serviceAccountJson={config.serviceAccountJson}
            /> }

    </Batch>);
}