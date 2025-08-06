#!/usr/bin/env node

import program from './program';


// NOTE: must initialize first before importing this
import "./get"
import "./list"
import "./aggregate"
import "./update"
import "./link"
import "./create"


program
  .name('fsq')
  .alias("firestore-query")
  .description('Query your firestore database')
  .version('0.0.1');

program.parse(process.argv);
