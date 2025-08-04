import { Command } from "commander";
import chalk from "chalk";
import { WHERE_FILTERS } from "../constants";
import { isValidOperation } from "./getWhereOperation";
import { WhereFilterOp } from "../types";
import { filterDocumentFields } from "./filterDocumentFields";
import { firestore } from "firebase-admin";

export function handleCollectionGroupOption(path: string) : FirebaseFirestore.CollectionGroup {
    console.log(chalk.cyan(`Fetching documents from collection group: ${chalk.blueBright(path)}`));
    const db = firestore()
    return db.collectionGroup(path)
}

export function handleCollectionOption(path: string) : FirebaseFirestore.CollectionReference {
    console.log(chalk.cyan(`Fetching documents from collection: ${chalk.blueBright(path)}`));
    const db = firestore()
    return db.collection(path);
}

export function handleLimitOption(ref: FirebaseFirestore.CollectionReference| FirebaseFirestore.CollectionGroup, limit: number) {
    const q = ref.limit(limit);
    console.log(
      chalk.gray("limit"),
      chalk.blueBright(limit)
    )
    return q
}

export function handleWhereOption({ctx, options, query}:{
    ctx: Command, options: {where: string[]}, query: FirebaseFirestore.Query}) {
    const whereOptions = options.where as string[];
    let whereQuery = query;
        for (const whereOption of whereOptions) {
          const [field, operation, value, rawType] = whereOption.split(",")
          const type = rawType || "string";
          if (!operation) {
            ctx.error(
              chalk.red(`Where operation not found\n
  valid operations:
  ${WHERE_FILTERS.join(", ")}\n
  EXAMPLE:
  firebaseq get users --where email,==,test@gmail.com
                `)
            )
            throw new Error("Where operation not found")
          }
          const validOperation = isValidOperation(operation)
          if (!validOperation) {
            ctx.error(
              chalk.red(
                `Invalid operation: ${operation}\n
  valid operations:
  ${WHERE_FILTERS.join(", ")}\n
  EXAMPLE:
  firebaseq get users --where email,==,test@gmail.com
                `
              )
            )
          }
          let parsedValue : any = value;
          if (type === "string") {
            parsedValue = value.toString();
          }
          if (type === "int" || type === "number") {
            parsedValue = parseInt(value)
          }
          if (type === "float") {
            parsedValue = parseFloat(value)
          }
          if (type == "bool" || type === "boolean") {
            parsedValue = Boolean(value)
          }
          if (type === "null") {
            parsedValue = null;
          }
          if (type === "date") {
            parsedValue = new Date(value)
          }
          // todo store geopoint in firebase
          

          whereQuery = query.where(field, operation as WhereFilterOp, parsedValue)
          console.log(
            chalk.gray("where"),
            chalk.green(field),
            chalk.redBright(operation),
            chalk.whiteBright(value),
            chalk.cyan(`type: ${type}`)
          )

        }
        return whereQuery
}

export function handleOrderByOption(q: FirebaseFirestore.Query, options: {orderBy: string}) {
    let [field, direction] = options.orderBy.split(",");
    direction = direction || "asc";
    console.log(chalk.cyan(`Ordered by: ${chalk.yellow(field)} (${direction})`));
    return q.orderBy(field, direction as "asc" | "desc");
}

/** NOTE: .select() method only works on collections/collectionGroups */
export function handleSelectFieldsCol(
    {ctx, query, options}:
    {ctx: Command, query :FirebaseFirestore.Query; options: {fields: string|undefined}}
) {
    if (!Array.isArray(options.fields)) {
        ctx.error(
          chalk.red("option.field is not an array.")
        )
        return query
      }
      const fields = options.fields as string[];
      return query.select(...fields)
}

export function handleSelectFieldsDoc(
    {ctx, document, options}:
    {ctx: Command, document :FirebaseFirestore.DocumentData; options: {fields: string|undefined}}
) {
    if (!Array.isArray(options.fields)) {
        ctx.error(
          chalk.red("option.field is not an array.")
        )
        return;
      }
      filterDocumentFields(document, options.fields)
}