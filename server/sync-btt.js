#!/usr/bin/env node

'use strict'

const minimist = require('minimist')
const moment = require('moment')

const beeminder = require('./beeminder')
const bttSync = require('./beeminder-time-tracking-sync')
const tt = require('./time-tracking')

var music = beeminder.goal(
  process.env.BEEMINDER_USERNAME,
  process.env.BEEMINDER_AUTH_TOKEN,
  process.env.BEEMINDER_GOAL,
)

var opts = minimist(process.argv.slice(2))

var apply = opts.apply
var lastWeek = moment().subtract(7, 'days').startOf('day')

async function sync(goal, tag, since, apply) {
  var iCalStr = await tt.getICalStr()

  var events = bttSync.sortEvents(tt.taggedEvents(since, iCalStr)[tag] || [])
  
  var datapoints = await goal.datapoints()
  datapoints = bttSync.sortAndFilterDatapoints(datapoints)

  var actions = bttSync.calcSyncActions(events, datapoints)

  console.log(actions)

  if (apply) {
    bttSync.applyActions(actions, goal)
  }
}

sync(music, process.env.BEEMINDER_GOAL, lastWeek, apply)
.catch(error => {
  console.log('Failed to synchronise Beeminder with calendar')
  console.log(error)
})
