import core from "./coreLogger.js";
import { runUpload } from "./edits.js";
import fs from "fs";
import { validateInAppUpdatePriority, validateReleaseFiles, validateStatus, validateUserFraction } from "./input-validation.js";
import { unlink, writeFile } from 'fs/promises'
import pTimeout from 'p-timeout'
export const PlayStore = {

    async Upload({
        packageName,
        releaseFiles,
        releaseFile,
        track = "beta",
        status = "draft",
        serviceAccountJson = void 0,
        serviceAccountJsonRaw = void 0,
        releaseName = void 0,
        inAppUpdatePriority = void 0,
        userFraction = void 0,
        whatsNewDir = void 0,
        mappingFile = void 0,
        debugSymbols = void 0,
        changesNotSentForReview = void 0,
        existingEditId = void 0,
    }) {

        try {

            await validateServiceAccountJson(serviceAccountJsonRaw, serviceAccountJson)
    
            // Validate user fraction
            let userFractionFloat: number | undefined
            if (userFraction) {
                userFractionFloat = parseFloat(userFraction)
            } else {
                userFractionFloat = undefined
            }
            await validateUserFraction(userFractionFloat)
    
            // Validate release status
            await validateStatus(status, userFractionFloat != undefined && !isNaN(userFractionFloat))
    
            // Validate the inAppUpdatePriority to be a valid number in within [0, 5]
            let inAppUpdatePriorityInt: number | undefined
            if (inAppUpdatePriority) {
                inAppUpdatePriorityInt = parseInt(inAppUpdatePriority)
            } else {
                inAppUpdatePriorityInt = undefined
            }
            await validateInAppUpdatePriority(inAppUpdatePriorityInt)
    
            // Check release files while maintaining backward compatibility
            if (releaseFile) {
                core.warning(`WARNING!! 'releaseFile' is deprecated and will be removed in a future release. Please migrate to 'releaseFiles'`)
            }
            const validatedReleaseFiles: string[] = await validateReleaseFiles(releaseFiles ?? [releaseFile])
    
            if (whatsNewDir != undefined && whatsNewDir.length > 0 && !fs.existsSync(whatsNewDir)) {
                core.warning(`Unable to find 'whatsnew' directory @ ${whatsNewDir}`);
            }
    
            if (mappingFile != undefined && mappingFile.length > 0 && !fs.existsSync(mappingFile)) {
                core.warning(`Unable to find 'mappingFile' @ ${mappingFile}`);
            }
    
            if (debugSymbols != undefined && debugSymbols.length > 0 && !fs.existsSync(debugSymbols)) {
                core.warning(`Unable to find 'debugSymbols' @ ${debugSymbols}`);
            }
    
            await pTimeout(
                runUpload(
                    packageName,
                    track,
                    inAppUpdatePriorityInt,
                    userFractionFloat,
                    whatsNewDir,
                    mappingFile,
                    debugSymbols,
                    releaseName,
                    changesNotSentForReview,
                    existingEditId,
                    status,
                    validatedReleaseFiles
                ),
                {
                    milliseconds: 3.6e+6
                }
            )
        // } catch (error: unknown) {
        //     if (error instanceof Error) {
        //         core.setFailed(error.message)
        //     } else {
        //         core.setFailed('Unknown error occurred.')
        //     }
        } finally {
            if (serviceAccountJsonRaw) {
                // Cleanup our auth file that we created.
                core.debug('Cleaning up service account json file');
                await unlink('./serviceAccountJson.json');
            }
        }

    }

};

async function validateServiceAccountJson(serviceAccountJsonRaw: string | undefined, serviceAccountJson: string | undefined): Promise<string | undefined> {
    if (serviceAccountJson && serviceAccountJsonRaw) {
        // If the user provided both, print a warning one will be ignored
        core.warning('Both \'serviceAccountJsonPlainText\' and \'serviceAccountJson\' were provided! \'serviceAccountJson\' will be ignored.')
    }

    if (serviceAccountJsonRaw) {
        // If the user has provided the raw plain text, then write to file and set appropriate env variable
        const serviceAccountFile = "./serviceAccountJson.json";
        await writeFile(serviceAccountFile, serviceAccountJsonRaw, {
            encoding: 'utf8'
        });
        // core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile)
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountFile;
    } else if (serviceAccountJson) {
        // If the user has provided the json path, then set appropriate env variable
        // core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountJson)
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountJson;
    } else {
        // If the user provided neither, fail and exit
        return Promise.reject("You must provide one of 'serviceAccountJsonPlainText' or 'serviceAccountJson' to use this action")
    }
}