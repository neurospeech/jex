import prompts from "prompts";

export interface IPrompt extends prompts.PromptObject {
    then: (r: string) => any;
    failed?: (r: any) => any;
}

export const Prompt = async ({ then, ... a}: IPrompt) => {
    if (!then) {
        throw new Error("then is required for prompt")
    }
    a.name ??= "value";
    a.type ??= "text";
    const r = await prompts([a]);
    return then(r.value);
};
