'use strict'

const minimist = require('minimist')
const moment = require('moment')

const beeminder = require('./beeminder')
const bttSync = require('./beeminder-time-tracking-sync')
const tt = require('dashboard-time-tracking/time-tracking')

var beeminder_username = process.env.BEEMINDER_USERNAME
var beeminder_auth_token = process.env.BEEMINDER_AUTH_TOKEN
var beeminder_goal = process.env.BEEMINDER_GOAL

var goal = beeminder.goal(
  beeminder_username,
  beeminder_auth_token,
  beeminder_goal,
)

async function handler(event) {
  var since = moment().subtract(7, 'days').startOf('day')

  var tag = beeminder_goal

  var iCalStr = await tt.getICalStr()

  var events = bttSync.sortEvents(tt.taggedEvents(since, iCalStr)[tag] || [])
  
  var datapoints = await goal.datapoints()
  datapoints = bttSync.sortAndFilterDatapoints(datapoints, since)

  var actions = bttSync.calcSyncActions(events, datapoints)

  console.log(actions)

  bttSync.applyActions(actions, goal)
}

module.exports = { handler };
