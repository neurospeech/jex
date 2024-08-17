# @neurospeech/jex
Easy shell scripting with JavaScript and E4X (Similar to JSX)

# Problem Definition

1. Bash, Powershell all scripting languages are limited in terms of language features.
2. Editor support is also limited.
3. Debugging is difficult.
4. We wanted to JavaScript as shell script, along with JSX to organize large set of commands.
5. So we created modified version of JSX which execute script little differently.

# Jex Script

Jex script is a simple JSX file, with slightly different execution sequence. Typical JSX nodes are converted to an organized set of node, attributes and children. However, in this JSX to JS transformation, children are created array of arrow function returning the child. This allows us
to put some JavaScript code between multiple commands.

# Example
node-version.jsx
```jsx
import { Batch, Run, invoke, Log } from "./dist/index.js";
let version = "";
invoke(<Batch>
    <Run
        cmd="node"
        args={["--version"]}
        logData={false}
        finished={(x) => version = x.text.trim() }
        />
    { /** Execute Code in the curly braces, it will not print on console */
        version = version + "..." }
    <Log
        text={version}
        />
    { /** Print following text directly on console... */}
    Running Node Directly...
    <Run
        cmd="node"
        args="--version"
        />
    {   /** call console.warn in an expression */
        console.warn("Warning !!")}
</Batch>)
```

Please note, when the command is finished, version variable will be set from the process's output.

Next executable code will be executed after first command has finished asychronously. As opposed to creation of JSX document.

```cmd
jex node-version.jsx
```

# Not Impressed?

Lets see little complicated example. Following file is referring security.jsx which contains reusable commands.

```jsx
import { Security } from "security.jsx";
// install certificate

const certPath = "cert.p12";
const certPass = process.env.CERT_PASS;
const keychainPass = process.env.CERT_PASS;
const keychainPath = "CERT_KEY_CHAIN";

invoke(<Batch>
    <Security.CreateKeyChain
        path={keychainPath}
        password={keychainPass}
        />
    <Security.SetKeychainSettings
        path={keychainPath}
        lut="21600"
        />
    <Security.UnlockKeychain
        path={keychainPath}
        password={keychainPass}
        />
    <Security.Import
        certPath={certPath}
        certPass={certPass}
        keychainPath={keychainPath}
        />
</Batch>);
```

security.jsx
```jsx
import { mask } from "@neurospeech/jex/dist/index.js";

//These are reusable functions...
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
            "-t", cert,
            "-f", format,
            "-k", keychainPath]}
            />;
    },
}
```

# Features
1. When commands are organized in library, while editing, code editor will provide intellisense along with compile time error for missing arguments.
2. Arguments can be well defined and encoded easily within the code.
3. You can easily utilize node's API.
