// load and execute script...

export { default as XNode } from "./core/XNode.js";

export { default as Batch } from "./core/Batch.js";

export { default as Run } from "./core/Run.js";

// execute passed script...

if (process.argv.length) {
    // check passed script arguments...

    // first arg will be the node
    // second arg will be the jex runner script

    // third arg onwards should be the batch that we would like to execute...

    
}