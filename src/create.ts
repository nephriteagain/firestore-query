import chalk from "chalk";
import program from "./program";
import { pathResolver } from "./utils/pathResolver";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";
import { FIELD_TYPES } from "./constants";

program
    .command("create")
    .description("create a firestore document")
    .argument("path", "document path")
    .hook("preAction", () => {
        bootstrapFirebase()
    })
    .option("-f --fields <fields...>", "fields to create in format 'field,value,type' (type is optional and will default to string is missing)")
    .action(async (path, options) => {
        path = pathResolver(path);
        const docArr = path.split("/");

        let ref : FirebaseFirestore.DocumentReference;
        
        const isCollection = docArr.length % 2 !== 0;
        if (isCollection) {
            // if only collection reference is submitted, we create the id
            ref = firestore().collection(path).doc()
            console.log(
                chalk.greenBright(`Collection path detected, creating document ${ref.path}`)
            )
        } else {
            ref = firestore().doc(path)
            console.log(
                chalk.greenBright(`Document path detected creating document ${ref.id}`)
            )
        }
        const fields = options.fields
       if (!fields || !Array.isArray(fields) || fields.length === 0) {
        program.error(
            chalk.red("no fields to create")
        )
        return;
       }
       const data : Record<string,any> = {};
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
                    parsedValue = new Date(value)
                }
            }
            data[field] = parsedValue
          // todo geoPoint
          // todo serverTimestamp
          // todo arrayUnion, arrayRemove
        
       }
       console.log(
        chalk.yellow("Fields to create:")
      )
      for (const d in data) {
        console.log(
            "   ",
            chalk.greenBright(d),
            chalk.blueBright(" -> "),
            chalk.redBright(data[d])
        )
      }
      console.log(
        chalk.gray(`Creating document...`)
      )
      await ref.create(data)
      console.log(
        chalk.bgGreen("SUCCESS")
      )
    })
    .addHelpText(
      "after",
      chalk.gray(`
Examples:

  # Create a document with auto-generated ID
  $ fsq create users -f name,John email,john@example.com

  # Create a document with specific ID
  $ fsq create users/abc123 -f name,John email,john@example.com

  # Create with different data types
  $ fsq create users/abc123 -f name,John age,25,int active,true,bool

  # Create with date field (timestamp)
  $ fsq create posts/xyz789 -f title,Hello created_at,1648771200000,date

  # Create with current date
  $ fsq create posts -f title,Hello created_at,now,date

  # Create with multiple field types
  $ fsq create products -f name,Widget price,19.99,float stock,100,int available,true,bool

  # Create with null field
  $ fsq create users -f name,John deleted_at,null,null

Available field types: string, int, number, float, bool, boolean, null, date
`)
    )