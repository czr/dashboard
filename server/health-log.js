/**
 * Endpoints for managing a health log. Exports an Express router with the
 * following endpoints.
 *
 * @module
 */

const express = require('express')
const mongodb = require('mongodb')
const csvStringify = require('csv-stringify/lib/sync')

function buildRouter (options) {
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
      const client = new mongodb.MongoClient(options.mongodbUrl)

      await client.connect()

      const db = client.db('health_log')
      const collection = db.collection('config')

      var schema = await collection.findOne({ _id: 'schema' })
      if (schema) {
        delete schema['_id']
        res.json(schema)
      } else {
        res.json({})
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

  router.put('/schema', async (req, res) => {
    try {
      const client = new mongodb.MongoClient(options.mongodbUrl)

      await client.connect()

      const db = client.db('health_log')
      const collection = db.collection('config')

      await collection.replaceOne(
        {
          '_id': 'schema',
        },
        {
          ...req.body,
          '_id': 'schema',
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
      const client = new mongodb.MongoClient(options.mongodbUrl)

      await client.connect()

      const db = client.db('health_log')
      const collection = db.collection('days')

      var dayRecord = await collection.findOne({ _id: req.params.date })
      if (dayRecord) {
        delete dayRecord['_id']
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
      const client = new mongodb.MongoClient(options.mongodbUrl)

      await client.connect()

      const db = client.db('health_log')
      const collection = db.collection('days')

      await collection.replaceOne(
        {
          '_id': req.params.date,
        },
        {
          ...req.body,
          '_id': req.params.date,
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
      const client = new mongodb.MongoClient(options.mongodbUrl)

      await client.connect()

      const db = client.db('health_log')
      const collection = db.collection('days')

      const cursor = collection.find({})
      const records = await cursor.toArray()

      var schema = await db.collection('config').findOne({ _id: 'schema' })
      if (schema) {
        delete schema['_id']
      } else {
        schema = {}
      }

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

function transformRecordsToCSV (records, schema) {
  return csvStringify(transformRecordsToArray(records, schema))
}

function transformRecordsToArray (records, schema) {
  const fields = Object.keys(schema).sort()

  const headers = ['date']
  fields.forEach((field) => {
    headers.push(field + ' (numeric)')
    headers.push(field + ' (string)')
  })

  let rows = []
  records.slice().sort((a, b) => {
    if (a._id < b._id) {
      return -1
    }
    if (a._id > b._id) {
      return 1
    }
    return 0
  }).forEach((record) => {
    let row = [record._id]
    fields.forEach((field) => {
      row.push(record[field] || 0)
      row.push(schema[field][record[field] - 1] || '')
    })
    rows.push(row)
  })

  return [headers].concat(rows)
}

module.exports = { buildRouter, transformRecordsToCSV, transformRecordsToArray }
