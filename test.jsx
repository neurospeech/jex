import { Batch, Run, invoke, Log } from "./dist/index.js";

let version = "";

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

    { /** Print following text directly on console... */}
    Running Node Directly...

    <Run
        cmd="node"
        args="--version"
        />
    
</Batch>)