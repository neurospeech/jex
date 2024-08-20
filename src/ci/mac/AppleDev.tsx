import { parse } from "path";
import Batch from "../../core/Batch.js";
import { FileSystem } from "../../utils/FileSystem.js";
import { Security } from "./Security.jsx";
import Run from "../../core/Run.js";
import he from "htmlencode";
const { htmlDecode } = he;


function getVal(xml, name) {
    var m = new RegExp(`<key>${name}<\\/key>\\n\\s*<string>(.+)<\\/string>`)
    return htmlDecode(xml.match(m)?.[1])
}

function getType(xml) {
    var types = {
        appstore: 'appstore',
        inhouse: 'inhouse',
        adhoc: 'adhoc',
        dev: 'dev',
    }
    if(xml.indexOf('<key>ProvisionsAllDevices</key>') >= 0) {
        return types.inhouse
    }
    if(xml.indexOf('<key>ProvisionedDevices</key>') < 0) {
        return types.appstore
    }
    if(xml.match(/<key>get-task-allow<\/key>\n\s*<true\/>/)) {
        return types.dev
    }
    return types.adhoc
}

function getInfo(xml) {
    var info = {} as any
    info.uuid = getVal(xml, 'UUID')
    info.team = {
        name: getVal(xml, 'TeamName'),
        id: getVal(xml, 'com.apple.developer.team-identifier'),
    }
    info.appid = getVal(xml, 'application-identifier')
    info.name = getVal(xml, 'Name')
    info.type = getType(xml)
    var cers = xml.match(/<key>DeveloperCertificates<\/key>\n\s*<array>\n\s*((?:<data>\S+?<\/data>\n\s*)+)<\/array>/)[1]
    info.cers = cers.match(/[^<>]{10,}/g)
    return info
}


export const AppleDev = {

    Clear({
        keyChainPath,
        provisioningProfile
    }) {
        const { base } = parse(provisioningProfile);
        return <Batch>
            <Security.DeleteKeychain
                path={keyChainPath}
                />
            <FileSystem.DeleteFile
                path={`~/Library/MobileDevice/Provisioning Profiles/${base}`}
                />
        </Batch>;
    },

    InstallCert({
        keyChainPath,
        keyChainPass = "abcd123",
        certPath,
        certPass,
        provisioningProfile,
        then = void 0 as ({ friendlyName, p12, pp }: { friendlyName: string, p12: any, pp: { name, appid, type, certs } }) => any
    }) {
        const { base } = parse(provisioningProfile);

        let friendlyName;
        let p12;

        return <Batch>
            <Security.DeleteKeychain
                path={keyChainPath}
                />
            <Security.CreateKeychain
                path={keyChainPath}
                password={keyChainPass}
                />
            <Security.UnlockKeychain
                path={keyChainPath}
                password={keyChainPass}
                />
            <Security.Import
                certPath={certPath}
                certPass={certPass}
                keychainPath={keyChainPath}
                then={(x) => (friendlyName = x.friendlyName, p12 = x.p12 )}
                />

            <FileSystem.Mkdir
                path="~/Library/MobileDevice/Provisioning Profiles"
                />

            <FileSystem.CopyFile
                src={provisioningProfile}
                dest={`~/Library/MobileDevice/Provisioning Profiles/${base}`}
                />

            <Run
                cmd="security"
                args={["cms", "-D", "-i", provisioningProfile]}
                logData={false}
                finished={(r) => then({ friendlyName, p12, pp: getInfo(r.text) }) }
                />

        </Batch>;
    }

};