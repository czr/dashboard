'use strict'

const ical = require('ical.js')
const axios = require('axios')
const moment = require('moment')

const URL = 'https://calendar.google.com/calendar/ical/REDACTED'

async function getTimeTracking() {
  var lastWeek = moment().subtract(7, 'days').startOf('day')

  const response = await axios.get(URL)

  return parseTimeTracking(lastWeek, response.data)
}

function parseTimeTracking(since, iCalStr) {
  var jCalData = ICAL.parse(iCalStr)
  var comp = new ICAL.Component(jCalData)
  var vevents = comp.getAllSubcomponents('vevent')

  var days = {}

  var weekEvents = vevents.map(
    vevent => { return new ICAL.Event(vevent) }
  ).filter(event => {
      var startTime = moment(event.startDate.toString())
      return startTime.isSameOrAfter(since)
  })

  var taggedEvents = {}
  weekEvents.forEach(event => {
    var tags = event.summary.match(/\#[A-Za-z0-9_]*/g)
    if (tags) {
      tags.forEach(tag => {
        tag = tag.replace(/\#/, '')
        if (!taggedEvents[tag]) {
          taggedEvents[tag] = []
        }
        taggedEvents[tag].push(event)
      })
    }
  })

  var taggedDayDurations = {}
  Object.keys(taggedEvents).forEach(tag => {
    var events = taggedEvents[tag]
    events.forEach(event => {
      var startTime = moment(event.startDate.toString())
      var endTime = moment(event.endDate.toString())

      var startDayStr = moment(event.startDate.toString()).startOf('day').format('YYYY-MM-DD')
      if (!taggedDayDurations[tag]) {
        taggedDayDurations[tag] = []
      }
      if (!taggedDayDurations[tag][startDayStr]) {
        taggedDayDurations[tag][startDayStr] = moment.duration(0)
      }

      taggedDayDurations[tag][startDayStr].add(
        moment.duration(endTime.diff(startTime))
      )
    })
  })

  var taggedDayStrings = {}
  Object.keys(taggedDayDurations).forEach(tag => {
    Object.keys(taggedDayDurations[tag]).forEach(date => {
      if (!taggedDayStrings[tag]) {
        taggedDayStrings[tag] = {}
      }
      taggedDayStrings[tag][date] = taggedDayDurations[tag][date].toISOString()
    })
  })

  return(taggedDayStrings)
}

module.exports = {
  "getTimeTracking": getTimeTracking,
  "parseTimeTracking": parseTimeTracking,
}
