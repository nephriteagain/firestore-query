import chalk from "chalk";
import program from "./program";
import { pathResolver } from "./utils/pathResolver";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";
import { FIELD_TYPES } from "./constants";

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
            if (!FIELD_TYPES.includes(type)) {
                program.error(
                    chalk.red(
                        `field ${field} has invalid type: ${type}
                        
                        valid types: ${FIELD_TYPES.join(", ")}
                        default type: string
                        `
                    )
                )
                return
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
                // if the user submits a timestamp
                const isTimestamp = !isNaN(Number(value))
                if (isTimestamp) {
                    parsedValue =  firestore.Timestamp.fromMillis(Number(value))
                }
                else if (value === "now") {
                    // user can use "now" to specify date right now
                    parsedValue = firestore.Timestamp.now()
                } else {
                    parsedValue(new Date(value))
                }
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
    .addHelpText(
      "after",
      chalk.gray(`
Examples:

  # Update a document with string fields
  $ firestoreq update users/abc123 -f name,John email,john@example.com

  # Update with different data types
  $ firestoreq update users/abc123 -f age,25,int active,true,bool

  # Update with date field (timestamp)
  $ firestoreq update posts/xyz789 -f created_at,1648771200000,date

  # Update with current date
  $ firestoreq update posts/xyz789 -f updated_at,now,date

  # Update multiple fields with different types
  $ firestoreq update products/item1 -f price,19.99,float stock,100,int available,true,bool

  # Set field to null
  $ firestoreq update users/abc123 -f deleted_at,null,null

Available field types: string, int, number, float, bool, boolean, null, date
`)
    )