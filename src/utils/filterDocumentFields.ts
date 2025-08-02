import { DocumentData } from "../types";
import chalk from "chalk";

export function filterDocumentFields(document: DocumentData|undefined, fields: string[]) {
    console.log(chalk.cyan(`Selected fields: ${chalk.yellow(fields.join(", "))}`));
        if (!document) {
            console.log(
                chalk.gray(
                    `All document fields is filtered out.`
                )
            )
            return;
        }
    for (const field in document) {
        if (!fields.includes(field)) {
          delete document[field];
        }
    }
    /** when document becomes because of filtering */
    if (Object.keys(document).length === 0) {
        console.log(
            chalk.gray(
                `All document fields is filtered out.`
            )
        )
        return;
    }
}