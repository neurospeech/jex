import { Batch, Run, run, Log } from "./dist/index.js";

const scope = {
    version: ""
};

run(<Batch>

    <Run
        path="node"
        args={["--version"]}
        logData={false}
        finished={(x) => scope.version = x.all.trim() }
        />
    
    <Log
        text={scope.version}
        />
    
</Batch>)