#!/usr/bin/env node

import { Command } from 'commander';
import readline from 'readline';
import * as cheerio from "cheerio"
import admin from "firebase-admin"
import serviceAcct from "../secret.json"

//@ts-ignore
admin.initializeApp({ credential: admin.credential.cert(serviceAcct)})

const program = new Command();

program
  .name('firestore query')
  .description('Query your firestore database')
  .version('0.0.1');

program
  .command("get")
  .description("get firebase document")
  .argument("<doc>", "collection/document name")
  // limit
  .option("-m --max [limit]", "maximum document to parse", "20")
  // select field to return
  .option("-f --fields [fields...]", "Fields to parse")
  // order by
  .option("-o --order-by [field]","The order of the document\ndefaulted to ascending\nexample:\n-o first_name\n-o first_name=desc")
  
  .action(async (doc : string, options) => {
    // we split the string with "/" to tell if its a doc or a collection
    const docArr = doc.split("/")
    // odd === collection, even === document
    const isCollection = docArr.length % 2 !== 0
    if (isCollection) {
      const ref = admin.firestore().collection(doc)
      let q = ref.limit(parseInt(options.max))
      if (options.orderBy) {
        const orderBy = options.orderBy
        let order : "asc"|"desc" = "asc"
        if (orderBy.includes("=")) {
          order = orderBy.split("=")[1]
        }
        q = q.orderBy(orderBy.split("=")[0], order)
      }
      const snap = await q.get()
      const docs = snap.docs.map(d => d.data())
      if (options.fields) {
        const fields = options.fields as string[];
        // we loop each documents and remove fields not specified
        for (const doc of docs) {
          for (const field in doc) {
            if (!fields.includes(field)) {
              delete doc[field]
            }
          }
        }
      } 
      console.log(docs)
      console.log(`FETCHED ${docs.length} DOCUMENTS FROM ${doc}`)
      return;
    }

    // doc
    const ref = admin.firestore().doc(doc)
    const snap = await ref.get()
    const document = snap.data()
    if (!document) {
      program.error("Document not found.")
    }
    if (options.fields) {
      const fields = options.fields as string[];
      for (const field in document) {
        if (!fields.includes(field)) {
          delete document[field]
        }
      }
    }
    console.log(document)
    return
  })


program.parse(process.argv);
