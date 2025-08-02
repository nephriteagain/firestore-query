import { WHERE_FILTERS } from "../constants"

export function getWhereOperation(whereOption: string) {
    for (const filter of WHERE_FILTERS) {
        const result = whereOption.includes(filter)
        if (result) {
            return filter
        }
    }
}