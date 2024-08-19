import { Batch, Run, invoke, Log, Prompt } from "./dist/index.js";

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

invoke(<Batch>

    <Run
        cmd="node"
        args={["--version"]}
        logData={false}
        finished={(x) => version = x.text.trim() }
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
        choices={["one", "two", "three"]}
        then={(value) => type = value}
        />
    
</Batch>)