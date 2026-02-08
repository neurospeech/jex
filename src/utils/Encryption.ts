import crypto from "node:crypto";
import { createReadStream, createWriteStream } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { pipeline } from "node:stream/promises";


export interface IEncryptFileParams {
    input: string;
    output: string;
    passphrase: string;
}

export const Encryption = {

    Aes256Cbc: {

        async Encrypt({
            input,
            output,
            passphrase
        }: IEncryptFileParams) {

            const algorithm = 'aes-256-cbc';
            const saltLength = 8;
            const ivLength = 16;
            const keyLength = 32; // 256 bits
            const iterations = 10000; // Default for openssl enc -pbkdf2
            const digest = 'sha256';            
            const salt = crypto.randomBytes(saltLength);

            // 2. Derive key and IV using PBKDF2
            // OpenSSL derives both key (32 bytes) and IV (16 bytes) from the same PBKDF2 call
            const keyIvBuffer = crypto.pbkdf2Sync(passphrase, salt, iterations, keyLength + ivLength, digest);
            const key = keyIvBuffer.subarray(0, keyLength);
            const iv = keyIvBuffer.subarray(keyLength, keyLength + ivLength);

            // 3. Create the cipher
            const cipher = crypto.createCipheriv(algorithm, key, iv);

            // 4. Create read/write streams and pipeline the encryption
            const inputStream = createReadStream(input);
            const outputStream = createWriteStream(output);

            // 5. Write the 'Salted__' prefix and the salt to the output file first
            outputStream.write(Buffer.from('Salted__', 'utf8'));
            outputStream.write(salt);

            await pipeline(inputStream, cipher, outputStream);
        },

        async Decrypt({
            input,
            output,
            passphrase
        }: IEncryptFileParams) {

            // --- Configuration ---
            const algorithm = 'aes-256-cbc';
            // Default OpenSSL values for -pbkdf2 without -iter or -md specified
            const iterations = 10000; // OpenSSL 3.0+ default iterations
            const digest = 'sha256';
            const keyLength = 32; // 256 bits
            const ivLength = 16; // 128 bits
            // ---------------------

            try {
                // 1. Read the encrypted file
                const inputData = await readFile(input);

                // 2. Extract salt and ciphertext from the input data
                // OpenSSL format is: Salted__ (8 bytes) + salt (8 bytes) + ciphertext
                const saltedPrefix = inputData.subarray(0, 8);
                if (saltedPrefix.toString('utf8') !== 'Salted__') {
                    throw new Error('Input file does not have the expected OpenSSL "Salted__" prefix.');
                }
                const salt = inputData.subarray(8, 16);
                const contents = inputData.subarray(16);

                // 3. Derive the key and IV using PBKDF2
                // The total length needed is keyLength + ivLength
                const keyIvBuffer = crypto.pbkdf2Sync(passphrase, salt, iterations, keyLength + ivLength, digest);
                const key = keyIvBuffer.subarray(0, keyLength);
                const iv = keyIvBuffer.subarray(keyLength, keyLength + ivLength);

                // 4. Create decipher object and decrypt
                const decipher = crypto.createDecipheriv(algorithm, key, iv);
                let decrypted = decipher.update(contents);
                decrypted = Buffer.concat([decrypted, decipher.final()]);

                // 5. Write the decrypted data to an output file
                await writeFile(output, decrypted);

            } catch (error) {
                console.error('Decryption failed:', error.message);
            }

        }
    }

};