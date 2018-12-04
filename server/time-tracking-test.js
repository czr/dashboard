#!/usr/bin/env node

'use strict'

const getTimeTracking = require('./time-tracking');

async function printTimeTracking() {
  console.log(await getTimeTracking())
}

printTimeTracking()
