require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { getTimeTracking } = require('ical-tagged-time')
const beeminder = require('beeminder-js')

const getLifeProgress = require('./life-progress')
const trello = require('./trello')

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

app.get('/api/trello/mit', async (req, res) => {
  res.json(
    await trello.getMITs(
      process.env.TRELLO_NEXT_ACTIONS_LIST,
      process.env.TRELLO_MIT_LABEL,
      process.env.TRELLO_KEY,
      process.env.TRELLO_TOKEN,
    )
  )
})

app.post('/api/trello/done', async (req, res) => {
  await trello.moveCard(
    req.body.card.id,
    process.env.TRELLO_DONE_LIST,
    process.env.TRELLO_KEY,
    process.env.TRELLO_TOKEN,
  )
  await beeminder.goal(
    process.env.BEEMINDER_USERNAME,
    process.env.BEEMINDER_AUTH_TOKEN,
    process.env.BEEMINDER_MIT_GOAL,
  ).createDatapoint({
    value: 1,
    comment: req.body.card.name,
  })
  res.json({"status": "ok"})
})

app.listen(port, () => console.log(`Listening on port ${port}`))
