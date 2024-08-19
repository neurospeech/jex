import Run from "../../core/Run.js";
import { mask } from "../../index.js";

export const Security = {

    CreateKeychain({
        password,
        path
    }) {
        return <Run
            cmd="security"
            args={["create-keychain", "-p", mask(password), path]}
            />
    },

    SetKeychainSettings({
        lut = 21600,
        path
    }) {
        return <Run
            cmd="security"
            args={["set-keychain-settings", "-lut", lut, path]}
            />
    },

    UnlockKeychain({
        password,
        path
    }) {
        return <Run
            cmd="security"
            args={["unlock-keychain", "-p", mask(password), path]}
            />
    },

    Import({
        certPath,
        certPass,
        keychainPath,
        format = "pkcs12",
        type = "cert",
    }) {
        return <Run
            cmd="security"
            args={["import", certPath,
            "-P", mask(certPass),
            "-A",
            "-t", type,
            "-f", format,
            "-k", keychainPath]}
            />;
    },

}; 