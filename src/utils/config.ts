import path from "path";
import os from "os"
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync } from "fs";
import chalk from "chalk";
import admin from "firebase-admin"

export const configDir = path.join(os.homedir(), ".firebaseq");
export const configPath = path.join(configDir, "config.json");

export type ConfigData = {
  serviceAccountPath: string;
};

export function saveConfig(data: ConfigData) {
    if (!existsSync(configDir)) mkdirSync(configDir);
    writeFileSync(configPath, JSON.stringify(data, null, 2));
    return configPath
  }
  
export function loadConfig() {
    if (!existsSync(configPath)) return null;
    return JSON.parse(readFileSync(configPath, "utf-8"));
}


export function deleteConfig(): boolean {
    if (existsSync(configPath)) {
      unlinkSync(configPath);
      return true;
    }
    return false;
  }

/**
 * checks if the users links the admin sdk
 */
export function bootstrapFirebase() {
  const config = loadConfig();

  if (!config || !config.serviceAccountPath) {
    console.error(
      chalk.red(
        "❌ No linked service account found.\nUse: firestoreq link <path to your service account>"
      )
    );
    process.exit(1);
  }

  // console.log(chalk.gray(`🔗 Using service account: ${config.serviceAccountPath}`));

  let serviceAcct;
  try {
    serviceAcct = require(config.serviceAccountPath);
  } catch (err) {
    if (err instanceof Error) {
      console.error(chalk.red(`❌ Failed to read service account file: ${err.message}`));
    }
    process.exit(1);
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAcct),
  });
}
