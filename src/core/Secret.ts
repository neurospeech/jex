const secretSymbol = Symbol("secret");

export class Secret {

    public get secret() {
        return this[secretSymbol];
    }

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
                    const v = a[index];
                    t += v.secret ? v.secret : v;
                    d += "********";
                }
            }
            this.display = d;
            secret = t;
        }
        Object.defineProperty(this, secretSymbol, {
            value: secret as any,
            enumerable: false
        });
    }

    toString() {
        return this.display;
    }
}