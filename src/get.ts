import program from "./program";
import chalk from "chalk";
import { pathResolver } from "./utils/pathResolver";
import { addSaveToFileOption, saveFile } from "./utils/addSaveToFileOption";
import { formatFirebaseDocument } from "./utils/formatFirebaseDocument";
import { 
  handleCollectionGroupOption, 
  handleCollectionOption, 
  handleLimitOption, 
  handleOrderByOption, 
  handleSelectFieldsCol, 
  handleSelectFieldsDoc, 
  handleWhereOption
} from "./utils";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";

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
    "firestore 'where' filter",
  )
  .option(
    "-c --collection-group",
    "the path is a collection group"
  )
  .option(
    "-j --json",
    "output as json"
  )
  .addOption(addSaveToFileOption())
  .hook("preAction", () => {
    bootstrapFirebase()
  })
  .hook("postAction", (thisCommand, actionCommand) => {
    saveFile(thisCommand.opts(), logs);
  })
  .action(async (path: string, options) => {
    path = pathResolver(path);
    const docArr = path.split("/");
    const isCollection = docArr.length % 2 !== 0;
    const db = firestore()
    if (isCollection) {
      let ref;
      if (options.collectionGroup) {
        ref = handleCollectionGroupOption(path)
      } else {
        ref = handleCollectionOption(path)
      }
      
      // limit
      let q = handleLimitOption(ref, parseInt(options.limit))
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
        q = handleWhereOption({ctx: program, options, query: q})
      }
      //


      /**
      * @description Order the results by a field. 
      * @example
      * firestoreq get users --o date=desc
      * firestoreq get users --o name
      */
      if (options.orderBy) {
        q =  handleOrderByOption(q, options)
      }
      
      // filter fields
      if (options.fields) {
        q = handleSelectFieldsCol({ctx: program, query: q, options})
      }

      const snap = await q.get();
      const docs = snap.docs.map((
        d: FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>
      ) => ({ data: d.data(), id: d.id }));

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

    const ref = db.doc(path);
    const snap = await ref.get();
    const document = snap.data();

    if (!document) {
      program.error(chalk.red("Document not found."));
      return;
    }

    if (options.fields) {
      handleSelectFieldsDoc({ctx: program, document, options})
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
  $ firestoreq get users/abc123

  # Get 10 documents from 'users' collection
  $ firestoreq get users -l 10

  # Get 5 users ordered by 'created_at' descending
  $ firestoreq get users -l 5 -o created_at=desc

  # Get only the 'name' and 'email' fields from a document
  $ firestoreq get users/abc123 -f name email

  # Save the result to a file
  $ firestoreq get users -s output.json
`)
  );