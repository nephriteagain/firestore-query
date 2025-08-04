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