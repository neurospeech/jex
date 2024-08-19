import prompts from "prompts";

export interface ICommandOption {
    required?: boolean;
    /** -- will be prefixed automatically */
    option: string;
    description?: string;
    /** - will be prefixed automatically */
    short?: string;
    defaultValue?: any;
    prompt?: string;
}

export default interface ICommand {
    name: string;
    description?: string;
    options: ICommandOption[];
    execute: (command, options, args: string[]) => void | Promise<void>;
}

class Command {

    public readonly cmd: ICommand = { name: "", options: [], execute: () => { throw new Error("Execute not defined") }};

    constructor(name) {
        this.cmd.name = name;
    }

    async executeCommand(options: string[]) {
        const received = {}
        const args = [];
        for (const element of options) {
            if (!element.startsWith("-")) {
                args.push(element);
                continue;
            }
            let option = element.startsWith("--") ? element.substring(2) : element.substring(1);
            const index = option.indexOf("=");
            let value = "";
            if (index !== -1) {
                value = option.substring(index + 1);
                option = option.substring(0, index);
            }
            received[option] = value;
        }

        for (const element of this.cmd.options) {
            let { option } = element;
            if (option.startsWith("--")) {
                option = option.substring(2);
            }
            if (received[option]) {
                continue;
            }

            if (element.defaultValue) {
                received[option] = element.defaultValue;
            }

            if (element.required) {
                // prompt...
                while (true) {
                    const text = await prompts({
                        message: element.prompt || element.option,
                        name: "value",
                        type: "text",
                    });
                    if (!text.value) {
                        continue;
                    }
                    received[option] = text.value;
                    break;
                }
            }
        }

        await this.cmd.execute(this.cmd.name, received, args);
    }

    description(description: string) {
        this.cmd.description = description;
        return this;
    }

    execute(fx: ((command: any, options: any, args: string[]) => void | Promise<void>)) {
        this.cmd.execute = fx;
        return this;
    }

    flag(option: string, description: string, ) {
        this.cmd.options.push({
            option,
            description
        })
        return this;
    }

    prompt(option: string, prompt: string, defaultValue?: string, description?: string, ) {
        this.cmd.options.push({
            option,
            prompt,
            defaultValue,
            description
        })
        return this;
    }

    requiredOption(option: string, prompt: string, description?: string, ) {
        this.cmd.options.push({
            option,
            prompt,
            required: true,
            description
        })
        return this;
    }

    toDetailedString() {
        let options = this.cmd.options.length ? "\nOptions:" : "";
        for (const i of this.cmd.options) {
            let option = `\n\t--${i.option}`;
            if (i.prompt) {
                option += `=${i.prompt}\t\t${i.description ?? ""}`;
            }
            options += `${option}`;
        }
        if (this.cmd.description) {
            return `${this.cmd.name}\n\t${this.cmd.description}${options}\t${this.cmd.description}\n\n`;
        }
        return `${this.cmd.name} ${options}\n\n`;
    }

    toString() {
        return `${this.cmd.name} [options]`;
    }
}

export class CLI {

    name = "CLI Name";

    description = "CLI Description";

    commands = [] as Command[];

    private defaultCmd = null as Command;

    async execute(argv = process.argv) {

        if (argv.length <= 2) {
            for (const element of this.commands) {
                console.log(element.toString());
            }
            process.exit(0);
            return;
        }

        try {

            const [program, script, command, ... options] = argv;

            if (/^help$/i.test(command)) {
                if (options.length) {
                    const cmd = this.findCommand(options[0]);
                    console.log(cmd.toDetailedString());
                    return;
                } 
                for (const element of this.commands) {
                    console.log(element.toDetailedString());
                }
                return;
            }

            let c = this.findCommand(command);

            if (!c) {
                c = this.defaultCmd;
                // need to move command to args...
                options.push(command);
            }

            if (!c) {
                console.error(`Command ${command} not found`);
                process.exit(1);
            }

            await c.executeCommand(options);

            process.exit(0);
            return;    
        } catch (error) {
            console.error(error);
            process.exit(1);
            return;
        }
        

    }

    findCommand(name: string) {
        for (const element of this.commands) {
            if (name === element.cmd.name) {
                return element;
            }
        }
    }

    command(name: string) {
        const cmd = new Command(name);
        this.commands.push(cmd);
        return cmd;
    }

    defaultCommand(name: string) {
        if (this.defaultCmd) {
            throw new Error("Cannot set multiple default command");
        }
        const cmd = new Command(name);
        this.commands.push(cmd);
        this.defaultCmd = cmd;
        return cmd;
    }

}

export let cli = new CLI();
