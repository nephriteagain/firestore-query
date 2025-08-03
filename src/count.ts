import program from "./program";
import { db } from "./constants";
import chalk from "chalk";
import { pathResolver } from "./utils/pathResolver";
import { addSaveToFileOption, saveFile } from "./utils/addSaveToFileOption";
import { handleCollectionGroupOption, handleCollectionOption, handleLimitOption, handleOrderByOption, handleSelectFieldsCol, handleSelectFieldsDoc, handleWhereOption } from "./utils";

const log = (text: any) => {
  logs.push(JSON.stringify(text, null, 4));
};
const logs: string[] = [];

program
  .command("count")
  .description("count  collection or collection group")
  .argument(
    "<path>", 
    "collection/collection group name"
  )
  .option(
    "-l --limit [limit]", 
    "maximum document to parse",
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
  .hook("postAction", (thisCommand, actionCommand) => {
    saveFile(thisCommand.opts(), logs);
  })
  .action(async (path: string, options) => {
    path = pathResolver(path);
    const docArr = path.split("/");
    const isCollection = docArr.length % 2 !== 0;
    if (!isCollection) {
      program.error(
        chalk.red(
          "invalid collection path", path
        )
      )
      return;
    }

    let ref;
    if (options.collectionGroup) {
      ref = handleCollectionGroupOption(path)
    } else {
      ref = handleCollectionOption(path)
    }
    
    let q: FirebaseFirestore.Query<FirebaseFirestore.DocumentData, FirebaseFirestore.DocumentData>;
    // --limit
    if (options.limit) {
      q = handleLimitOption(ref, parseInt(options.limit))
    } else {
      q = ref;
    }


    // --where
    if (options.where && options.where.length > 0) {
      q = handleWhereOption({ctx: program, options, query: q})
    }

    const snap = await q.count().get();
    const count = snap.data()

    // --json
    if (options.json) {
      console.log(JSON.stringify(count, null, 4))
    } else {
      console.log(
        chalk.cyan("total count: "),
        chalk.bold(chalk.blueBright(
          count.count
        ))
      )
    }
    // save to logs
    log(snap.data())

    console.log(chalk.green(`\nFETCHED COUNT FROM ${path}\n`));
    
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