'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { getTimeTracking } = require('ical-tagged-time')
const beeminder = require('beeminder-js')
var proxy = require('express-http-proxy')

const getLifeProgress = require('./life-progress')
const MIT = require('./mit')

const healthLogRouter = require('./health-log').router

const app = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/life-progress', (req, res) => res.json({
  'life-progress': getLifeProgress(),
}))

app.get('/api/time-tracking', async (req, res) => {
  try {
    res.json(
      await getTimeTracking(process.env.GOOGLE_CALENDAR_URL)
    )
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
})

const goal = beeminder.goal(
  process.env.BEEMINDER_USERNAME,
  process.env.BEEMINDER_AUTH_TOKEN,
  process.env.BEEMINDER_MIT_GOAL,
)
const mit = new MIT({
  trelloTaskList: process.env.TRELLO_NEXT_ACTIONS_LIST,
  trelloDoneList: process.env.TRELLO_DONE_LIST,
  trelloLabel: process.env.TRELLO_MIT_LABEL,
  trelloKey: process.env.TRELLO_KEY,
  trelloToken: process.env.TRELLO_TOKEN,
  goal: goal,
})

app.get('/api/mit/cards', async (req, res) => {
  res.json(
    await mit.getMITs()
  )
})

app.post('/api/mit/done', async (req, res) => {
  try {
    await mit.done(
      req.body.card.id,
      req.body.card.name,
    )
    res.json({ 'status': 'ok' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.use('/api/health-log', healthLogRouter)

if (process.env.CLIENT_PROXY_URL) {
  app.use(proxy(process.env.CLIENT_PROXY_URL))
} else {
  app.use(express.static('client-build'))
}

app.listen(port, () => console.log(`Listening on port ${port}`))
