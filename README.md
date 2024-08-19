# @neurospeech/jex
Easy shell scripting with JavaScript and E4X (Similar to JSX)

# Problem Definition

1. Bash, Powershell all scripting languages are limited in terms of language features.
2. Editor support is also limited.
3. Debugging is difficult.
4. We wanted to JavaScript as shell script, along with JSX to organize large set of commands.
5. So we created modified version of JSX which execute script little differently.

# Jex Script

Jex script is a simple JSX file, with slightly different execution sequence.

Typical JSX nodes are converted to an organized set of nodes, and each properties are set at time of creation. Jex processes JSX nodes little differently, each child node is created at time of execution, so values of previous node can be considered as an input to next node.

This allows us to put some JavaScript code between multiple commands. In the given example, you will see that first command receives version and it is stored, in next command we are printing same version.

Each command executes asynchronously and you can easily break or continue execution based on previous step's result without having to write async/await.

# Getting Started
```bash
npm install -g @neurospeech/jsx
```

# Example
node-version.jsx
```jsx
import { Batch, Run, invoke, Log } from "@neurospeech/jex/index.js";
let version = "";
await invoke(<Batch>
    <Run
        cmd="node"
        args={["--version"]}
        logData={false}
        finished={(x) => version = x.text.trim() }
        />
    { /** Execute Code in the curly braces, it will not print on console */
        version = `Installed node version is ${version}` }

    { console.log(version) }

    <Run
        cmd="node"
        args="--version"
        />
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
import { Security } from "@neurospeech/jex/dist/ci/mac/Security.js";
// install certificate

const certPath = "cert.p12";
const certPass = process.env.CERT_PASS;
const keychainPass = process.env.CERT_PASS;
const keychainPath = "CERT_KEY_CHAIN";

await invoke(<Batch>
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

# Features
1. When commands are organized in library, while editing, code editor will provide intellisense along with compile time error for missing arguments.
2. Arguments can be well defined and encoded easily within the code.
3. You can easily utilize node's API.
4. This is a viable alternative of yml files. As every jex library can easily incorporate required arguments needed along with jsdoc help.
5. This can be used in CI/CD, that can be truly platform independent, so same build script can be used in any DevOp environment wherever node is installed.

# Library Authoring

To create reusable functions for jex, you should not transform JSX to JS, instead use `jex parse folder` to transform your JSX to JS.