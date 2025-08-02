import program from "./program";
import admin from "firebase-admin"
import { pathResolver } from "./utils/pathResolver";


program
  .command("get")
  .description("get firebase document")
  .argument("<path>", "collection/document name")
  // limit
  .option("-l --limit [limit]", "maximum document to parse", "20")
  // select field to return
  .option("-f --fields [fields...]", "Fields to parse")
  // order by
  .option("-o --order-by [field]","The order of the document\ndefaulted to ascending\nexample:\n-o first_name\n-o first_name=desc")
  
  .action(async (path : string, options) => {
    path = pathResolver(path)
    // we split the string with "/" to tell if its a doc or a collection
    const docArr = path.split("/")
    // odd === collection, even === document
    const isCollection = docArr.length % 2 !== 0
    if (isCollection) {
      const ref = admin.firestore().collection(path)
      let q = ref.limit(parseInt(options.limit))
      if (options.orderBy) {
        const orderBy = options.orderBy
        let order : "asc"|"desc" = "asc"
        if (orderBy.includes("=")) {
          order = orderBy.split("=")[1]
        }
        q = q.orderBy(orderBy.split("=")[0], order)
      }
      const snap = await q.get()
      const docs = snap.docs.map(d => ({data: d.data(), id: d.id}))
      if (options.fields) {
        const fields = options.fields as string[];
        // we loop each documents and remove fields not specified
        for (const doc of docs) {
          for (const field in doc) {
            if (!fields.includes(field)) {
              delete doc.data[field]
            }
          }
        }
      }
      console.log(docs)
      console.log(`FETCHED ${docs.length} DOCUMENTS FROM ${path}`)
      return;
    }

    // doc
    const ref = admin.firestore().doc(path)
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