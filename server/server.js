'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { getTimeTracking } = require('ical-tagged-time')
const beeminder = require('beeminder-js')

const getLifeProgress = require('./life-progress')
const MIT = require('./mit')
const trello = require('./trello')

const healthLogRouter = require('./health-log').router

const app = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/life-progress', (req, res) => res.json({
  "life-progress": getLifeProgress(),
}))

app.get('/api/time-tracking', async (req, res) => {
  res.json(
    await getTimeTracking(process.env.GOOGLE_CALENDAR_URL)
  )
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

app.get('/api/trello/mit', async (req, res) => {
  res.json(
    await mit.getMITs()
  )
})

app.post('/api/trello/done', async (req, res) => {
  await mit.moveCard(
    req.body.card.id,
    req.body.card.name,
  )
  res.json({"status": "ok"})
})

app.use('/api/health-log', healthLogRouter)

app.listen(port, () => console.log(`Listening on port ${port}`))
