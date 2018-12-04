'use strict'

const ical = require('ical.js')
const axios = require('axios')
const moment = require('moment')

const URL = 'https://calendar.google.com/calendar/ical/REDACTED'

async function getTimeTracking() {
  var lastWeek = moment().subtract(7, 'days').startOf('day')

  const response = await axios.get(URL)

  var jCalData = ICAL.parse(response.data)
  var comp = new ICAL.Component(jCalData)
  var vevents = comp.getAllSubcomponents('vevent')

  var days = {}

  var weekEvents = vevents.map(
    vevent => { return new ICAL.Event(vevent) }
  ).filter(event => {
      var startTime = moment(event.startDate.toString())
      return startTime.isSameOrAfter(lastWeek)
  })

  var nosferatuEvents = weekEvents.filter(event => {
    return event.summary === 'Nosferatu'
  })

  var dayDurations = {}
  nosferatuEvents.forEach(event => {
    var startTime = moment(event.startDate.toString())
    var endTime = moment(event.endDate.toString())

    var startDayStr = moment(event.startDate.toString()).startOf('day').format('YYYY-MM-DD')
    if (!dayDurations[startDayStr]) {
      dayDurations[startDayStr] = moment.duration(0)
    }

    dayDurations[startDayStr].add(
      moment.duration(endTime.diff(startTime))
    )
  })

  var dayStrings = {}
  Object.keys(dayDurations).forEach(key => {
    dayStrings[key] = dayDurations[key].toISOString()
  })

  return({'nosferatu': dayStrings})
}

module.exports = getTimeTracking;
