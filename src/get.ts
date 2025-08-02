import program from "./program";
import admin from "firebase-admin";
import chalk from "chalk";
import { pathResolver } from "./utils/pathResolver";
import { addSaveToFileOption, saveFile } from "./utils/addSaveToFileOption";
import { db, WHERE_FILTERS } from "./constants";
import { formatFirebaseDocument } from "./utils/formatFirebaseDocument";
import { getWhereOperation } from "./utils/getWhereOperation";
import { filterDocumentFields } from "./utils/filterDocumentFields";

const log = (text: any) => {
  console.log(text);
  logs.push(JSON.stringify(text, null, 4));
};
const logs: string[] = [];

program
  .command("get")
  .description("get firebase document or collection data")
  .argument(
    "<path>", 
    "collection/document name"
  )
  .option(
    "-l --limit [limit]", 
    "maximum document to parse", "20"
  )
  .option(
    "-f --fields [fields...]", 
    "Fields to parse"
  )
  .option(
    "-o --order-by [field]",
    "The order of the documents\nDefault: ascending\nExamples:\n  -o first_name\n  -o first_name=desc"
  )
  .option(
    "-w --where <where...>",
    "firestore 'where' filter"
  )
  .option(
    "-c --collection-group",
    "collection group name"
  )
  .option(
    "-j --json",
    "output as json"
  )
  .addOption(addSaveToFileOption())
  .hook("postAction", (thisCommand, actionCommand) => {
    saveFile(thisCommand.opts(), logs);
  })
  .action(async (path: string, options) => {
    path = pathResolver(path);
    const docArr = path.split("/");
    const isCollection = docArr.length % 2 !== 0;

    if (isCollection) {
      let ref;
      if (options.collectionGroup) {
        console.log(chalk.cyan(`Fetching documents from collection group: ${chalk.blueBright(path)}`));
        ref = db.collectionGroup(path)
      } else {
      console.log(chalk.cyan(`Fetching documents from collection: ${chalk.blueBright(path)}`));
        ref = admin.firestore().collection(path);
      }
      
      // limit
      let q = ref.limit(parseInt(options.limit));
      console.log(
        chalk.gray("limit"),
        chalk.blueBright(options.limit)
      )
      // 

      /**
       * where
       * 
       * @example
       * firestoreq get users --where email=test@gmail.com
       * 
       * // multi query sample
       * firestoreq get users --where first_name=john last_name=pork
       */
      if (options.where && options.where.length > 0) {
        const whereOptions = options.where as string[];
        for (const whereOption of whereOptions) {
          const operation = getWhereOperation(whereOption)
          if (!operation) {
            program.error(
              chalk.red(`Where operation not found\n
  valid operations:
  ${WHERE_FILTERS.join(", ")}\n
  EXAMPLE:
  firebaseq get users --where email==test@gmail.com
                `)
            )
            return;
          }
          // currently only supports string values;
          const [ field, value ] = whereOption.split(operation)
          q = q.where(field, operation, value)
          console.log(
            chalk.gray("where"),
            chalk.green(field),
            chalk.redBright(operation),
            chalk.whiteBright(value)
          )
        }
      }
      //


      /**
      * @description Order the results by a field. 
      * @example
      * firestoreq get users --o date=desc
      * firestoreq get users --o name
      */
      if (options.orderBy) {
        let [field, direction] = options.orderBy.split("=");
        direction = direction || "asc";
        q = q.orderBy(field, direction as "asc" | "desc");
        console.log(chalk.cyan(`Ordered by: ${chalk.yellow(field)} (${direction})`));
      }
      //

      const snap = await q.get();
      const docs = snap.docs.map((d) => ({ data: d.data(), id: d.id }));

      // filter fields
      if (options.fields) {
        if (!Array.isArray(options.fields)) {
          program.error(
            chalk.red("option.field is not an array.")
          )
          return;
        }
        const fields = options.fields as string[];
        for (const doc of docs) {
          filterDocumentFields(doc.data, fields)
        }
      }
      //

      // show as JSON
      if (options.json) {
        log(docs);
      //
      } else {
        for (const doc of docs) {
          formatFirebaseDocument(doc.data, doc.id)
        }
      }

      console.log(chalk.green(`\nFETCHED ${docs.length} DOCUMENT(S) FROM ${path}\n`));
      return;
    }

    // collection grouo
    if (options.collectionGroup) {
      program.error(
        chalk.red("Invalid collection group flag while querying a document.")
      )
    }
    //

    console.log(chalk.cyan(`Fetching document: ${chalk.blueBright(path)}`));

    const ref = admin.firestore().doc(path);
    const snap = await ref.get();
    const document = snap.data();

    if (!document) {
      program.error(chalk.red("Document not found."));
      return;
    }

    if (options.fields) {
      if (!Array.isArray(options.fields)) {
        program.error(
          chalk.red("option.field is not an array.")
        )
        return;
      }
      filterDocumentFields(document, options.fields)
    }
    if (options.json) {
      log(document)
    } else {
      formatFirebaseDocument(document)

    }
    console.log(chalk.green(`\nDOCUMENT FETCHED FROM ${path} \n`));
  })
  .addHelpText(
    "after",
    chalk.gray(`
Examples:

  # Get a single document
  $ fsq get users/abc123

  # Get 10 documents from 'users' collection
  $ fsq get users -l 10

  # Get 5 users ordered by 'created_at' descending
  $ fsq get users -l 5 -o created_at=desc

  # Get only the 'name' and 'email' fields from a document
  $ fsq get users/abc123 -f name email

  # Save the result to a file
  $ fsq get users -s output.json
`)
  );
