import chalk from "chalk";
import program from "./program"
import { saveConfig, deleteConfig } from "./utils/config";
import fs from "fs"
import path from "path"

program
    .command("link")
    .description("link your admin service account")
    .argument("path", "path to your admin service account")
    .action((inputPath) => {
        const resolvedPath = path.resolve(inputPath); // ✅ absolute path

        // Check if the file exists
        if (!fs.existsSync(resolvedPath)) {
        program.error(chalk.red(`❌ File does not exist: ${resolvedPath}`));
        return;
        }

        // Check if it's a .json file
        if (path.extname(resolvedPath) !== ".json") {
        program.error(chalk.red("❌ The file must be a .json file."));
        return;
        }

        const configPath = saveConfig({ serviceAccountPath: resolvedPath });

        console.log(
            chalk.bold(
                chalk.green(`✅ Linked service account: ${resolvedPath}`))
            );
            console.log(
                chalk.bold(
                    chalk.green(`\n✅ Save config to: ${configPath}`))
                );
    })
    .addHelpText(
      "after",
      chalk.gray(`
Examples:

  # Link a Firebase Admin service account
  $ firestoreq link path/to/service-account.json

  # Link with relative path
  $ firestoreq link ./config/firebase-admin-key.json

  # Link with absolute path
  $ firestoreq link /home/user/firebase-service-account.json
`)
    )

program
    .command("unlink")
    .description("unlink your admin service account")
    .action(() => {
        const status = deleteConfig()
        if (!status) {
            program.error(
                chalk.red("❌ No linked service account found.")
            )
            return
        }
        console.log(
            chalk.green("✅ Unlinked service account.")
        )
    })
    .addHelpText(
      "after",
      chalk.gray(`
Examples:

  # Unlink the currently linked service account
  $ firestoreq unlink
`)
    )