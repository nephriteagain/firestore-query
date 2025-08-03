#!/usr/bin/env node

import readline from 'readline';
import * as cheerio from "cheerio"
import admin from "firebase-admin"
import serviceAcct from "../secret.json"
import program from './program';

//@ts-ignore
admin.initializeApp({ credential: admin.credential.cert(serviceAcct)})

// NOTE: must initialize first before importing this
import "./get"
import "./list"
import "./aggregate"


program
  .name('firestoreq')
  .alias("fsq")
  .description('Query your firestore database')
  .version('0.0.1');

program.parse(process.argv);
