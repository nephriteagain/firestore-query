import chalk from "chalk";
import { Command } from "commander";
import program from "./program";
import { pathResolver } from "./utils/pathResolver";
import { bootstrapFirebase } from "./utils/config";
import { firestore } from "firebase-admin";

export const deleteCmd = new Command()
    .name("delete")
    .description("delete a firestore document")
    .argument("path", "document path")
    .hook("preAction", () => {
        bootstrapFirebase()
    })
    .action(async (path) => {
        path = pathResolver(path);
        const docArr = path.split("/");
        
        const isCollection = docArr.length % 2 !== 0;
        if (isCollection) {
            program.error(
                chalk.red(
                    "must be a valid document path"
                )
            )
            return;
        }
        const ref = firestore().doc(path)
        console.log(
            chalk.greenBright(`deleting document in path ${ref.id}`)
        )
      
      console.log(
        chalk.gray(`Deleting document...`)
      )
      await ref.delete()
      console.log(
        chalk.bgGreen("DELETE SUCCESS")
      )
    })
    .addHelpText(
        "after",
        chalk.gray(`
    Examples:
    
    # Delete a Firestore document by path
    $ fsq delete users/user123
    
    # Delete a document inside a nested subcollection
    $ fsq delete clubs/club123/events/event456
    
    Note:
    - The argument must be a valid Firestore document path (e.g., "collection/docId").
    - This command will fail if a collection path is passed instead of a document path.
    - If you want to use conditional deletion (e.g., only delete if not updated since a specific time),
        you can modify this command to include Firestore's Precondition:
        ref.delete({ lastUpdateTime: '<ISO 8601 timestamp>' })
    
    Learn more about Precondition:
    https://firebase.google.com/docs/reference/admin/node/firebase-admin.firestore.Precondition
    `)
    )