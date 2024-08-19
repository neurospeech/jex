import prompts from "prompts";

export interface IPrompt extends prompts.PromptObject {
    then: (r: string) => any;
    failed?: (r: any) => any;
}

export const Prompt = async (a: IPrompt) => {
    a.name ??= "value";
    a.type ??= "text";
    const r = await prompts([a]);
    return a.then(r.value);
};
