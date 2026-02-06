import { invoke, Batch, Run, mask } from "../../dist/index.js";
import { FileSystem } from "../../dist/utils/FileSystem.js";
import { PlayStore } from "../../dist/ci/android/PlayStore.js";
import { Build } from "../../dist/ci/build/Build.js";
import { fileURLToPath } from "url";
import { readFile } from "fs/promises";
import { writeFile } from "fs";

const positronAppDir = fileURLToPath(import.meta.resolve("./app"));

/**
 * 
 * @param {{ filePath: string, replace: (text: string) => string }} p 
 */
const ReplaceText = async ({ filePath, replace }) => {
    let text = await readFile(filePath, "utf-8");
    text = replace(text);
    await writeFile(filePath, text);
}; 

export const Common = {
    PreBuild({ env: {
        MAUI_ICON_IOS_COLOR = "#FFFFFF",
        MAUI_ICON_DROID_COLOR = "#FFFFFF",
        MAUI_SPLASH_SCREEN_COLOR = "#FFFFFF",
        MAUI_SPLASH_BASE_SIZE="128,128"
    } = {} }) {
        return <Batch>
            <FileSystem.RemoveDir
                path="./maui"
                force={true}
                recursive={true}
                />
    
            <FileSystem.Mkdir
                path="./maui"
                />

            <Run cmd="cd" args={["./maui"]} />

            <FileSystem.CopyFolder
                src={positronAppDir}
                dest="./maui"
                />
    
            <FileSystem.CopyFile
                src="./res/app-icon-background.svg"
                dest="./maui/PositronApp/Resources/AppIcon/appicon.svg"
                />
    
            <FileSystem.CopyFile
                src="./res/app-icon.droid.svg"
                dest="./maui/PositronApp/Resources/AppIcon/appicon.droid.svg"
                />

            <FileSystem.CopyFile
                src="./res/app-icon.ios.svg"
                dest="./maui/PositronApp/Resources/AppIcon/appicon.ios.svg"
                />

            <FileSystem.CopyFile
                src="./res/spalsh.svg"
                dest="./maui/PositronApp/Resources/Splash/splash.svg"
                />

            <FileSystem.CopyFile
                src="./config/google-services.json"
                dest="./maui/PositronApp/conifg/google-services.json"
                />

            <ReplaceText
                filePath="./maui/PositronApp/Positron.csproj"
                replace={(text) => {
                    text = text.replaceAll("$(MAUI_ICON_IOS_COLOR)", MAUI_ICON_IOS_COLOR);
                    text = text.replaceAll("$(MAUI_ICON_DROID_COLOR)", MAUI_ICON_DROID_COLOR);
                    text = text.replaceAll("$(MAUI_SPLASH_SCREEN_COLOR)", MAUI_SPLASH_SCREEN_COLOR);
                    text = text.replaceAll("$(MAUI_SPLASH_BASE_SIZE)", MAUI_SPLASH_BASE_SIZE);
                    return text;
                }}
                />

        </Batch>; 
        
    }
};