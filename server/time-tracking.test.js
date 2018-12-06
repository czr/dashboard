const moment = require('moment')
const { parseTimeTracking } = require('./time-tracking')

test('one event', () => {
  since = moment('2001-01-01')
  iCalStr = iCal()
  result = parseTimeTracking(since, iCalStr)
  expected = {
    'nosferatu': {
      '2018-12-06': 'PT1H',
    }
  }
  expect(result).toEqual(expected)
})

function iCal() {
  return `
BEGIN:VCALENDAR
PRODID:-//Dummy//Unit Test//iCal
VERSION:2.0

BEGIN:VTIMEZONE
TZID:Europe/London

BEGIN:DAYLIGHT
TZOFFSETFROM:+0000
TZOFFSETTO:+0100
TZNAME:BST
DTSTART:19700329T010000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT

BEGIN:STANDARD
TZOFFSETFROM:+0100
TZOFFSETTO:+0000
TZNAME:GMT
DTSTART:19701025T020000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD

END:VTIMEZONE

BEGIN:VEVENT
DTSTART:20181206T150000Z
DTEND:20181206T160000Z
UID:1@test.com
SUMMARY:Nosferatu
END:VEVENT

END:VCALENDAR
`
}
