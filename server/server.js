'use strict'

require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const { getTimeTracking } = require('ical-tagged-time')
const beeminder = require('beeminder-js')
const mongodb = require('mongodb')

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

// Stub health-log implementation

app.get('/api/health-log/schema', async (req, res) => {
  res.json(
    {
      "Nasal congestion": ["Mild", "Moderate", "Severe"],
      "Sore throat": ["Inflamed", "Mild", "Moderate", "Severe"],
    }
  )
})

app.get('/api/health-log/days/2019-03-20', async (req, res) => {
  res.json(
    {
      "Nasal congestion": 2,
      "Headache": 1
    }
  )
})

app.put('/api/health-log/days/:date(\\d{4}-\\d{2}-\\d{2})', async (req, res) => {
  try {
    const client = new mongodb.MongoClient(process.env.MONGODB_URL)

    await client.connect();

    const db = client.db('health_log');
    const collection = db.collection('days')

    const result = await collection.updateOne(
      {
        "_id": req.params.date,
      },
      {
        $set: {
          ...req.body,
          "_id": req.params.date,
        },
      },
      {
        upsert: true,
      },
    )
    res.status(204).send()
  } catch (err) {
    console.log(err)
    res.status(500).json(
      {
        error: err,
      }
    )
  }

})

app.listen(port, () => console.log(`Listening on port ${port}`))
