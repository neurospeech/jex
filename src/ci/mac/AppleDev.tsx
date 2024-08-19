import { parse } from "path";
import Batch from "../../core/Batch.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { Security } from "./Security.jsx";

export const AppleDev = {

    InstallCert({
        keyChainPath,
        keyChainPass = "abcd123",
        certPath,
        certPass,
        provisioningProfile,
        then = void 0 as ({ friendlyName, p12}) => any
    }) {
        const { base } = parse(provisioningProfile);
        return <Batch>
            <Security.CreateKeychain
                path={keyChainPath}
                password={keyChainPass}
                />
            <Security.SetKeychainSettings
                path={keyChainPath}
                />
            <Security.UnlockKeychain
                path={keyChainPath}
                password={keyChainPass}
                />
            <Security.Import
                certPath={certPath}
                certPass={certPass}
                keychainPath={keyChainPath}
                then={then}
                />

            <FileSystem.Mkdir
                path="~/Library/MobileDevice/Provisioning Profiles"
                />

            <FileSystem.CopyFile
                src={provisioningProfile}
                dest={`~/Library/MobileDevice/Provisioning Profiles/${base}`}
                />

            
        </Batch>;
    }

};