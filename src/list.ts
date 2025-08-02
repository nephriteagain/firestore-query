import program from "./program";
import { db } from "./constants";
import { pathResolver } from "./utils/pathResolver";

program
    .command("list")
    .description("list firestore collection")
    .argument("[path]", "optional document path for nested collection")
    .option("-s --save <path>", "save result to file", "list.txt")
    .action(async (path, options) => {
        path = pathResolver(path)
        console.log(`listing path of ${path ? path : "root"}`)
        if (path) {
            const pathLength = (path as string).split("/").length
            let docRef
            // checks if the path is a collection
            if (pathLength % 2 !== 0) {
                console.log("collection path detected, will list the nested collection of the first document it encountered\n")
                const colSnaps = await db.collection(path).limit(1).get()
                const firstDoc = colSnaps.docs[0].id
                if (!firstDoc) {
                    throw new Error(`collection ${path} has  no valid document.`)
                }
                // reference the first document in the collection
                docRef = db.collection(path).doc(firstDoc)
                console.log(`listing collection of ${docRef.path}...`)
            } else {
                // valid document path reference it immediately
                docRef = db.doc(path)
            }
            const collections = await docRef.listCollections()
            const collectionName = collections.map(c => c.path)
            console.log("\n")
            console.log(`${docRef.path} sub collections\n`)
            if (collections.length === 0) {
                console.log("collection is empty.")
            }
            for (const c of collectionName) {
                const collectionName = c.split("/").slice(-1)[0]
                console.log(`   ${collectionName}`)
            }
            console.log("\n")
            return;
        }
        const collections = await db.listCollections()
        const collectionName = collections.map(c => c.path)
        console.log("\n")
        console.log("Root collections\n")
        if (collections.length === 0) {
            console.log("collection is empty.")
        }
        for (const c of collectionName) {
            console.log(`   ${c}`)
        }
        console.log("\n")
    })