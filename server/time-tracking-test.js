#!/usr/bin/env node

'use strict'

const ical = require('ical.js')
const axios = require('axios')
const moment = require('moment')

const URL = 'https://calendar.google.com/calendar/ical/REDACTED'

parseCalendar(URL)

async function parseCalendar(url) {
  try {
    var lastWeek = moment('2018-11-21')

    const response = await axios.get(url)

    var jCalData = ICAL.parse(response.data)
    var comp = new ICAL.Component(jCalData)
    var vevents = comp.getAllSubcomponents('vevent')

    var durations = []
    var arrayLength = vevents.length
    for (var i = 0; i < arrayLength; i++) {
      var vevent = vevents[i]
      var event = new ICAL.Event(vevent);
      // console.log(event.startDate)
      var startTime = moment(event.startDate.toString())
      var endTime = moment(event.endDate.toString())
      // console.log(getMethods(event.startDate))
      // console.log(event.startDate + ' -> ' + startTime.format())


      if (startTime.isSameOrAfter(lastWeek)) {
        if (event.summary === 'Nosferatu') {
          var duration = moment.duration(endTime.diff(startTime))
          console.log(duration.toISOString())
          durations.push(duration)
        }
      }
    }
  
    var totalDuration = moment.duration(0)
    var arrayLength = durations.length
    for (var i = 0; i < arrayLength; i++) {
      totalDuration.add(durations[i])
    }
    console.log('Total: ' + totalDuration.toISOString())
  } catch (error) {
    console.error(error)
  }
}

function getMethods(obj) {
    var res = [];
    for(var m in obj) {
        if(typeof obj[m] == "function") {
            res.push(m)
        }
    }
    return res;
}
