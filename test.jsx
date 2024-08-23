import { Batch, Run, invoke, Log, Prompt, mask } from "./dist/index.js";
import assert from "assert";

let version = "";

let type = "";

const Node = {
    Version() {
        return <Run
            cmd="node"
            args={["--version"]}
            />
    }
};

const masked = mask `/p:Password=${"abcd123"}`;

await invoke(<Batch>

    <Run
        cmd="node"
        args={["--version"]}
        logData={false}
        then={(x) => version = x.text.trim() }
        />

    {
        /** Execute Code in the curly braces, this will not be printed. */
        version = version + "..."
    }

    <Log
        text={version}
        />

    { /** Print following text directly on console... */
        console.log("Executing Node")
    }

    <Run
        cmd="node"
        args="--version"
        />

    <Node.Version/>

    <Prompt
        message="Type"
        choices={[{
            title: "One"            
        }, {
            title:"Two"
        }, {
            title: "Three"
        }]}
        then={(v) => type = v}
        />
    
    { console.log(type)}

    { console.log(masked)}
    { console.log(masked.secret)}

    { assert.fail("Failed")}

    { console.log("Should not print")}

</Batch>)