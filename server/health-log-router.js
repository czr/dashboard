/**
 * Endpoints for managing a health log. Exports an Express router with the
 * following endpoints.
 *
 * @module
 */

const express = require('express')
const { HealthLog, transformRecordsToCSV } = require('./health-log')

function buildRouter (options) {
  const healthLog = new HealthLog(options.mongodbUrl)
  const router = new express.Router()

  /**
   * @name /schema
   *
   * @description
   * Represents a schema as JSON. E.g.:
   *
   * ```
   * {
   *   "Nasal congestion": ["Mild", "Moderate", "Severe"],
   *   "Sore throat": ["Inflamed", "Mild", "Moderate", "Severe"]
   * }
   * ```
   *
   * Accepts GET and PUT methods.
   *
   * A successful PUT will return a 204 No Content response.
   */
  router.get('/schema', async (req, res) => {
    try {
      const schema = await healthLog.getSchema()
      res.json(schema)
    } catch (err) {
      console.log(err)
      res.status(500).json(
        {
          error: err,
        }
      )
    }
  })

  router.put('/schema', async (req, res) => {
    try {
      await healthLog.setSchema(req.body)
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

  /**
   * @name /days/&lt;YYYY-MM-DD&gt;
   *
   * @description
   * Represents a day record as JSON. E.g.:
   *
   * ```
   * {
   *   "Nasal congestion": "Mild",
   *   "Sore throat": "Severe"
   * }
   * ```
   *
   * Accepts GET and PUT methods.
   *
   * A successful PUT will return a 204 No Content response.
   *
   * Where no record has been set for a given date, a GET will return 404.
   */
  router.get('/days/:date(\\d{4}-\\d{2}-\\d{2})', async (req, res) => {
    try {
      const dayRecord = await healthLog.getDay(req.params.date)

      if (dayRecord) {
        res.json(dayRecord)
      } else {
        res.status(404).send()
      }
    } catch (err) {
      console.log(err)
      res.status(500).json(
        {
          error: err,
        }
      )
    }
  })

  router.put('/days/:date(\\d{4}-\\d{2}-\\d{2})', async (req, res) => {
    try {
      await healthLog.setDay(req.params.date, req.body)

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

  /**
   * @name /days.csv;
   *
   * @description
   * Returns all records as CSV. E.g.:
   *
   * ```
   * date,       "Nasal Congestion (numeric)", "Nasal Congestion (string)", ...
   * 2019-03-23,                            1,                      "Mild", ...
   * ...
   * ```
   *
   * Accepts GET method.
   */
  router.get('/days.csv', async (req, res) => {
    try {
      const [records, schema] = await Promise.all([
        healthLog.getDays(),
        healthLog.getSchema(),
      ])

      res.set('Content-Type', 'text/csv')
      res.send(transformRecordsToCSV(records, schema))
    } catch (err) {
      console.log(err)
      res.status(500).json(
        {
          error: err,
        }
      )
    }
  })

  return router
}

module.exports = {
  buildRouter,
}
