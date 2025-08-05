import { type WhereFilterOp } from "./types";

/**
 * NOTE: MUST BE ARRANGE LIKE THIS SPECIFICALLY
 * WILL LOOP REGEX THIS
 */
export const WHERE_FILTERS : WhereFilterOp[] = [
    "array-contains-any",
    "array-contains",
    "not-in",
    "in",
    "==",
    "!=",
    "<",
    "<=",
    ">=",
    ">",
]

export enum VALID_FIELD_TYPES {
    STRING = "string",
    NUMBER = "number",
    INT = "int",
    FLOAT = "float",
    BOOLEAN = "boolean",
    BOOL = "bool",
    NULL = "null",
    DATE = "date"
}

export const FIELD_TYPES = [
    VALID_FIELD_TYPES.STRING,
    VALID_FIELD_TYPES.NUMBER,
    VALID_FIELD_TYPES.INT,
    VALID_FIELD_TYPES.FLOAT,
    VALID_FIELD_TYPES.BOOLEAN,
    VALID_FIELD_TYPES.BOOL,
    VALID_FIELD_TYPES.NULL,
    VALID_FIELD_TYPES.DATE
]