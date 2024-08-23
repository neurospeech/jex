import Run from "../../core/Run.js";
import { Batch, mask } from "../../index.js";
import { ParsePkcs12 } from "../certs/ParsePkcs12.js";

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

    DeleteKeychain({
        path,
        throwOnFail = false
    }) {
        return <Run
            cmd="security"
            throwOnFail={throwOnFail}
            args={["delete-keychain", path]}
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
        keychainPass,
        format = "pkcs12",
        type = "cert",
        then = void 0 as ({ friendlyName, p12 } ) => any
    }) {
        return <Batch>
            <Run
                cmd="security"
                args={["import", certPath,
                "-P", mask(certPass),
                "-A",
                "-t", type,
                "-f", format,
                "-k", keychainPath]}
                />;
            <Run
                cmd="security"
                args={[
                    "set-key-partition-list",
                    "-S", "apple-tool:,apple:,codesign:",
                    "-s",
                    "-k", keychainPass,
                    keychainPath
                ]}
                />
            <Run
                cmd="security"
                args={[
                    "list-keychain",
                    "-d", "user",
                    "-s", keychainPath
                ]}
                />
            <ParsePkcs12
                certPath={certPath}
                certPass={certPass}
                then={then}
                />
        </Batch>
    }

}; 