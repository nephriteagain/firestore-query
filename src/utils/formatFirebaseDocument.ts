import chalk from "chalk";
import { DocumentData, Timestamp, GeoPoint, DocumentReference } from "../types";

export function formatFirebaseDocument(document: DocumentData|undefined, id?: string) {
    if (!document) {
        console.log("  ",chalk.red("Document not found."))
        return
    }
    if (id) {
        console.log("  ",chalk.bold("Document id: "),chalk.underline(id))
    }
    // for empty documents
    if (Object.keys(document.length === 0)) {
        console.log(
            "    ",
            chalk.red("Empty document\n")
        )
    }
    for (const key in document) {
        let value = document[key];

        let type: string;
        let colorFn: (str: string) => string;

        if (isNull(value)) {
        type = "null";
        colorFn = chalk.gray;

        } else if (isBool(value)) {
        type = "boolean";
        colorFn = chalk.yellowBright;
        
        } else if (isString(value)) {
        type = "string";
        colorFn = chalk.green;

        } else if (isNumber(value)) {
        type = "number";
        colorFn = chalk.cyan;

        } else if (isArray(value)) {
        type = "array";
        colorFn = chalk.magentaBright;

        } else if (isTimestamp(value)) {
        type = "timestamp";
        value = formatTimestamp(value)
        colorFn = chalk.blueBright;
        
        } else if (isGeoPoint(value)) {
        type = "geopoint";
        colorFn = chalk.hex("#FFA500"); // orange

        } else if (isReference(value)) {
        type = "reference";
        colorFn = chalk.whiteBright;

        } else if (isBytes(value)) {
        type = "bytes";
        colorFn = chalk.red;

        } else if (isMap(value)) {
        type = "map";
        colorFn = chalk.magenta;

        } else {
        type = typeof value;
        colorFn = chalk.white;
        }

        console.log("    ",chalk.bold(key))
        console.log("    ", value)
        console.log("    ",colorFn(type))
        console.log("")
    }
}

// --- Type Guards ---

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isNull(value: unknown): value is null {
  return value === null;
}

function isBool(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function isTimestamp(value: unknown): value is typeof Timestamp {
  return value instanceof Timestamp;
}

function isGeoPoint(value: unknown): value is typeof GeoPoint {
  return value instanceof GeoPoint;
}

function isReference(value: unknown): value is typeof DocumentReference {
  return value instanceof DocumentReference;
}

function isBytes(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array || Buffer.isBuffer(value);
}

function isMap(value: unknown): value is object {
  return typeof value === "object" && value !== null && !Array.isArray(value) &&
         !(value instanceof Timestamp) && !(value instanceof GeoPoint) &&
         !(value instanceof DocumentReference) && !(value instanceof Uint8Array) &&
         !Buffer.isBuffer(value);
}

function formatTimestamp(timestamp: typeof Timestamp) {
    // @ts-ignore
    return new Date(timestamp.toDate()).toLocaleString()
}
