export class Secret {

    public readonly secret: string;

    public readonly display: string = "********";

    constructor(secret: string | TemplateStringsArray, ... a) {
        if (Array.isArray(secret)) {
            let t = "";
            let d = "";
            for (let index = 0; index < secret.length; index++) {
                const element = secret[index];
                t += element;
                d += element;
                if (index < a.length) {
                    t += a[index];
                    d += "********";
                }
            }
            this.display = d;
            secret = t;
        }
        this.secret = secret as string;
    }

    toString() {
        return this.display;
    }
}