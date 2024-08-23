import { readFile } from "fs/promises";
import forge from "node-forge";

export async function ParsePkcs12 ({
    certPath,
    certPass,
    then = void 0 as ({ friendlyName, p12 }) => void
}) {


    const buffer = await readFile(certPath);

    var p12Asn1 = forge.asn1.fromDer(new forge.util.ByteStringBuffer(buffer));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, certPass);
    const bag = p12.safeContents.find((x) => x.encrypted).safeBags[0].attributes;
    const friendlyName = bag.friendlyName[0];

    return { friendlyName, p12 };
}