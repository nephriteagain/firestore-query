import {  Option } from "commander";
import fs from "fs"

export function addSaveToFileOption() {
    return new Option("-s --save <filePath>", "save result to file")
}

/**
 * Save output to file if --save is passed 
 * */
export function saveFile(options: any, logs: string[]) {
    if (options.save) {
        fs.writeFileSync(options.save, logs.join("\n"));
        console.log(`\nResult saved to ${options.save}`);
    }
}