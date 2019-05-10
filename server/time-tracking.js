const axios = require('axios')
const express = require('express')
const itt = require('ical-tagged-time')
const moment = require('moment')

function buildRouter () {
  const router = new express.Router()

  router.get('/', async (req, res) => {
    var lastWeek = moment().subtract(7, 'days').startOf('day')
    var iCalStrPromise = getICalStr(process.env.GOOGLE_CALENDAR_URL)
    var taggedTime = new itt.TaggedTime(iCalStrPromise, lastWeek)
    try {
      res.json(
        await taggedTime.parseTimeTracking()
      )
    } catch (err) {
      console.log(err)
      res.status(500).json({ error: err.message })
    }
  })

  return router
}

async function getICalStr (url) {
  const response = await axios.get(url)
  return response.data
}

module.exports = { buildRouter }
