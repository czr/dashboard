'use strict'

require('dotenv').config()

const bodyParser = require('body-parser')
const express = require('express')
const proxy = require('express-http-proxy')

const healthLog = require('./health-log')
const lifeProgress = require('./life-progress')
const mit = require('./mit-router')
const timeTracking = require('./time-tracking')

const healthLogRouter = healthLog.buildRouter()
const lifeProgressRouter = lifeProgress.buildRouter(
  process.env.BIRTHDAY,
)
const mitRouter = mit.buildRouter({
  beeminderUsername: process.env.BEEMINDER_USERNAME,
  beeminderAuthToken: process.env.BEEMINDER_AUTH_TOKEN,
  beeminderGoal: process.env.BEEMINDER_MIT_GOAL,
  trelloTaskList: process.env.TRELLO_NEXT_ACTIONS_LIST,
  trelloDoneList: process.env.TRELLO_DONE_LIST,
  trelloLabel: process.env.TRELLO_MIT_LABEL,
  trelloKey: process.env.TRELLO_KEY,
  trelloToken: process.env.TRELLO_TOKEN,
})
const timeTrackingRouter = timeTracking.buildRouter()

const app = express()
const port = process.env.PORT || 5000
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/api/health-log', healthLogRouter)
app.use('/api/life-progress', lifeProgressRouter)
app.use('/api/mit', mitRouter)
app.use('/api/time-tracking', timeTrackingRouter)

if (process.env.CLIENT_PROXY_URL) {
  app.use(proxy(process.env.CLIENT_PROXY_URL))
} else {
  app.use(express.static('client-build'))
}

app.listen(port, () => console.log(`Listening on port ${port}`))
