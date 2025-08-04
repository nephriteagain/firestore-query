import chalk from "chalk";
import program from "./program";
import { pathResolver } from "./utils/pathResolver";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";

program
    .command("update")
    .description("update a firestore document")
    .argument("path", "document path")
    .hook("preAction", () => {
        bootstrapFirebase()
    })
    .option("-f --fields <fields...>", "fields to update in format 'field,value,type' (type is optional and will default to string is missing)")
    .action(async (path, options) => {
        path = pathResolver(path);
        const docArr = path.split("/");
        const isCollection = docArr.length % 2 !== 0;
        if (isCollection) {
            program.error(
                chalk.red("invalid document path")
            )
            return
        }
        const ref = firestore().doc(path)
        const fields = options.fields
       if (!fields || !Array.isArray(fields) || fields.length === 0) {
        program.error(
            chalk.red("no fields to update")
        )
        return;
       }
       const updates : Record<string,any> = {};
       for (const f of fields) {
            const [field, value, rawType] = f.split(",")
            const type = rawType || "string";

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
            updates[field] = parsedValue
          // todo geoPoint
          // todo serverTimestamp
          // todo arrayUnion, arrayRemove
        
       }
       console.log(
        chalk.yellow("Fields to update:")
      )
      for (const u in updates) {
        console.log(
            "   ",
            chalk.greenBright(u),
            chalk.blueBright(" -> "),
            chalk.redBright(updates[u])
        )
      }
      console.log(
        chalk.gray(`Updating ${path}...`)
      )
      await ref.update(updates)
      console.log(
        chalk.bgGreen("SUCCESS")
      )
    }) 