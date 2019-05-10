'use strict'

require('dotenv').config()

const beeminder = require('beeminder-js')
const bodyParser = require('body-parser')
const express = require('express')
const proxy = require('express-http-proxy')

const healthLog = require('./health-log')
const lifeProgress = require('./life-progress')
const timeTracking = require('./time-tracking')
const MIT = require('./mit')

const healthLogRouter = healthLog.buildRouter()
const lifeProgressRouter = lifeProgress.buildRouter(
  process.env.BIRTHDAY,
)
const timeTrackingRouter = timeTracking.buildRouter()

const app = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const goal = new beeminder.Goal(
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
app.use('/api/life-progress', lifeProgressRouter)
app.use('/api/time-tracking', timeTrackingRouter)

if (process.env.CLIENT_PROXY_URL) {
  app.use(proxy(process.env.CLIENT_PROXY_URL))
} else {
  app.use(express.static('client-build'))
}

app.listen(port, () => console.log(`Listening on port ${port}`))
