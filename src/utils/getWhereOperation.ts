import { WHERE_FILTERS } from "../constants"

export function getWhereOperation(operation: string) {
    for (const filter of WHERE_FILTERS) {
        const result = operation.includes(filter)
        if (result) {
            return filter
        }
    }
}

export function isValidOperation(operation: string) {
    return WHERE_FILTERS.some(f => f === operation)
}