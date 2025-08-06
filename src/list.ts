import program from "./program";
import { pathResolver } from "./utils/pathResolver";
import { addSaveToFileOption, saveFile } from "./utils/addSaveToFileOption";
import chalk from "chalk";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";

const logs: string[] = [];
const log = (text: string) => {
  console.log(text);
  logs.push(text);
};

program
  .command("list")
  .description("list firestore collection")
  .argument("[path]", "optional document path for nested collection")
  .addOption(addSaveToFileOption())
  .hook("preAction", () => {
    bootstrapFirebase()
  })
  .hook("postAction", (thisCommand, actionCommand) => {
    saveFile(thisCommand.opts(), logs);
  })
  .action(async (path, options) => {
    path = pathResolver(path);
    log(chalk.gray(`📁 Listing path: ${path || "root"}`));
    const db = firestore()
    if (path) {
      const pathLength = (path as string).split("/").length;
      let docRef;

      // collection path
      if (pathLength % 2 !== 0) {
        console.log(
          chalk.cyan("ℹ️  Collection path detected. Will list the nested collections of the first document found.\n")
        );
        const colSnaps = await db.collection(path).limit(1).get();
        const firstDoc = colSnaps.docs[0]?.id;

        if (!firstDoc) {
          throw new Error(chalk.red(`❌ Collection '${path}' has no valid documents.`));
        }

        docRef = db.collection(path).doc(firstDoc);
        console.log(chalk.blueBright(`🔍 Listing collections under: ${docRef.path}\n`));
      } else {
        docRef = db.doc(path);
      }

      const collections = await docRef.listCollections();
      const collectionNames = collections.map((c) => c.id);

      console.log(chalk.blueBright(`📚 Subcollections of ${docRef.path}\n`));
      if (collections.length === 0) {
        log(chalk.magenta("⚠️  No subcollections found."));
      } else {
        for (const name of collectionNames) {
          log(chalk.green(`   • ${name}`));
        }
      }
    } else {
      const collections = await db.listCollections();
      const collectionNames = collections.map((c) => c.id);

      console.log(chalk.blueBright("📚 Root Collections\n"));
      if (collections.length === 0) {
        log(chalk.magenta("⚠️  No collections found at root level."));
      } else {
        for (const name of collectionNames) {
          log(chalk.green(`   • ${name}`));
        }
      }
    }
  })
  .addHelpText(
    "after",
    `
Examples:

  $ firestoreq list
    - Lists all root collections.

  $ firestoreq list users/abc123
    - Lists subcollections inside the document 'users/abc123'.

  $ firestoreq list users -s output.txt
    - Lists subcollections of the first document in 'users' and saves it to output.txt.
`
  );
