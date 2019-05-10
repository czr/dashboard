const express = require('express')
const beeminder = require('beeminder-js')

const MIT = require('./mit')

function buildRouter (options) {
  const goal = new beeminder.Goal(
    options.beeminderUsername,
    options.beeminderAuthToken,
    options.beeminderGoal,
  )
  const mit = new MIT({
    trelloTaskList: options.trelloTaskList,
    trelloDoneList: options.trelloDoneList,
    trelloLabel: options.trelloLabel,
    trelloKey: options.trelloKey,
    trelloToken: options.trelloToken,
    goal: goal,
  })

  const router = new express.Router()
  router.get('/cards', async (req, res) => {
    res.json(
      await mit.getMITs()
    )
  })
  router.post('/done', async (req, res) => {
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

  return router
}

module.exports = { buildRouter }
