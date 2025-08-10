import { program } from "commander";
import { Command } from "commander";
import chalk from "chalk";
import { pathResolver } from "./utils/pathResolver";
import { addSaveToFileOption, saveFile } from "./utils/addSaveToFileOption";
import { handleCollectionGroupOption, handleCollectionOption, handleLimitOption, handleOrderByOption, handleSelectFieldsCol, handleSelectFieldsDoc, handleWhereOption } from "./utils";
import { firestore } from "firebase-admin"
import { bootstrapFirebase } from "./utils/config";


const log = (text: any) => {
  logs.push(JSON.stringify(text, null, 4));
};
const logs: string[] = [];

const sum = firestore.AggregateField.sum
const average = firestore.AggregateField.average
const count =  firestore.AggregateField.count

export const aggregate  =new Command()
  .name("aggregate")
  .description("aggregate count, sum, and average collection or collection group")
  .argument(
    "<path>", 
    "collection/collection group name"
  )
  // aggregation options
  .option(
    "--count",
    "count of field"
  )
  .option(
    "--sum <field>",
    "sum of field"
  )
  .option(
    "--average <field>",
    "average of field"
  )
  //---------------------/
  
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
    if (!isCollection) {
      program.error(
        chalk.red(
          "invalid collection path", path
        )
      )
      return;
    }
    
    if (!options.count && !options.sum && !options.average) {
      program.error(`
        ${chalk.red("select atleast 1 aggregation options")}
        ${chalk.yellow(`--count`)}
        ${chalk.yellow(`--sum <field>`)}
        ${chalk.yellow(`--average <field>`)}
      `)
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

    const aggregationOption :  {
      count?: firestore.AggregateField<number>;
      sum?: firestore.AggregateField<number>;
      average?: firestore.AggregateField<number | null>;
  } = {
      "count": count(),
      "sum": sum(options.sum),
      "average": average(options.average)
    }

    if (!options.count) {
      delete aggregationOption.count
    }
    if (!options.sum) {
      delete aggregationOption.sum
    }
    if (!options.average) {
      delete aggregationOption.average
    }

    const snap = await q.aggregate(aggregationOption).get()

  
    // --json
    if (options.json) {
      console.log(snap.data())
    } else {
      if (options.sum) {
        console.log(
          chalk.cyan(`field ${options.sum} sum: `),
          chalk.bold(chalk.blueBright(
            snap.data().sum
          ))
        )
      }
      if (options.average) {
        console.log(
          chalk.greenBright(`field ${options.average} average: `),
          chalk.bold(chalk.blueBright(
            snap.data().average
          ))
        )
      }
      if (options.count) {
        console.log(
          chalk.yellowBright(`total count: `),
          chalk.bold(chalk.blueBright(
            snap.data().count
          ))
        )
      }
      
      
    }
    // save to logs
    log(snap.data())

    console.log(chalk.green(`\nFETCHED COUNT FROM ${path}\n`));
    
  })
  .addHelpText(
    "after",
    chalk.gray(`
Examples:

  # Count documents in 'users' collection
  $ fsq aggregate users --count

  # Sum all 'score' field values in 'games' collection
  $ fsq aggregate games --sum score

  # Get average 'age' of users
  $ fsq aggregate users --average age

  # Count and sum with filters
  $ fsq aggregate users --count --sum score -w status,==,active

  # Aggregate collection group with limit
  $ fsq aggregate posts --count -c -l 100

  # Save aggregation results to file
  $ fsq aggregate users --count --average age -s results.json
`)
  );