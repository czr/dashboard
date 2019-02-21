'use strict'

const ical = require('ical.js')
const axios = require('axios')
const moment = require('moment')

require('dotenv').config()

const URL = process.env.GOOGLE_CALENDAR_URL

async function getICalStr() {
  const response = await axios.get(URL)
  return response.data
}

async function getTimeTracking() {
  var lastWeek = moment().subtract(7, 'days').startOf('day')
  return parseTimeTracking(lastWeek, getICalStr())
}

function taggedEvents(since, iCalStr) {
  var jCalData = ICAL.parse(iCalStr)
  var comp = new ICAL.Component(jCalData)
  var vevents = comp.getAllSubcomponents('vevent')

  var weekEvents = vevents.map(vevent => {
    // ICAL.Event objects use their own ICAL.Time object for times, which is
    // somewhat confusing. Better to expose just a regular JS Date, which can
    // then be easily converted to moment if necessary.
    var iCalEvent = new ICAL.Event(vevent)
    return {
      startDate: iCalEvent.startDate.toJSDate(),
      endDate: iCalEvent.endDate.toJSDate(),
      summary: iCalEvent.summary,
    }
  }).filter(event => {
      var startTime = moment(event.startDate)
      return startTime.isSameOrAfter(since)
  })

  var tagged = {}
  weekEvents.forEach(event => {
    var tags = event.summary.match(/\#[A-Za-z0-9_]*/g)
    if (tags) {
      tags.forEach(tag => {
        tag = tag.replace(/\#/, '').toLowerCase()
        if (!tagged[tag]) {
          tagged[tag] = []
        }
        tagged[tag].push(event)
      })
    }
  })
  return tagged
}

function parseTimeTracking(since, iCalStr) {
  var tagged = taggedEvents(since, iCalStr)

  var taggedDayDurations = {}
  Object.keys(tagged).forEach(tag => {
    var events = tagged[tag]
    events.forEach(event => {
      var startTime = moment(event.startDate)
      var endTime = moment(event.endDate)

      var startDayStr = moment(event.startDate).startOf('day').format('YYYY-MM-DD')
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
  "taggedEvents": taggedEvents,
  "parseTimeTracking": parseTimeTracking,
  "getICalStr": getICalStr,
}
