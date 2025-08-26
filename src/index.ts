#!/usr/bin/env node

import program from './program';


// NOTE: must initialize first before importing this
import {get} from "./get"
import {list} from "./list"
import {aggregate} from "./aggregate"
import {update} from "./update"
import {link} from "./link"
import {create} from "./create"
import {deleteCmd} from "./delete"


program
  .name('fsq')
  .alias("firestore-query")
  .description('Query your firestore database')
  .version('0.0.6');

program.addCommand(get)
program.addCommand(list)
program.addCommand(aggregate)
program.addCommand(update)
program.addCommand(link)
program.addCommand(create)
program.addCommand(deleteCmd)



program.parse(process.argv);
