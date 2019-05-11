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

class HealthLog {
  constructor (mongodbUrl) {
    this.mongodbUrl = mongodbUrl
    this.db = undefined
  }

  async dbConnection () {
    if (this.db) {
      return this.db
    }

    const client = new mongodb.MongoClient(this.mongodbUrl)
    await client.connect()

    this.db = client.db('health_log')
    return this.db
  }

  async getSchema () {
    const collection = (await this.dbConnection()).collection('config')

    var schema = await collection.findOne({ _id: 'schema' })
    if (schema) {
      delete schema['_id']
      return schema
    } else {
      return {}
    }
  }

  async setSchema (schema) {
    const collection = (await this.dbConnection()).collection('config')

    await collection.replaceOne(
      {
        '_id': 'schema',
      },
      {
        ...schema,
        '_id': 'schema',
      },
      {
        upsert: true,
      },
    )
  }

  async getDay (date) {
    const collection = (await this.dbConnection()).collection('days')

    var dayRecord = await collection.findOne({ _id: date })
    if (dayRecord) {
      delete dayRecord['_id']
      return dayRecord
    } else {
      return null
    }
  }

  async setDay (date, record) {
    const collection = (await this.dbConnection()).collection('days')

    await collection.replaceOne(
      {
        '_id': date,
      },
      {
        ...record,
        '_id': date,
      },
      {
        upsert: true,
      },
    )
  }

  async getDays () {
    const collection = (await this.dbConnection()).collection('days')

    const cursor = collection.find({})
    const recordsArray = await cursor.toArray()

    const recordsHash = {}
    recordsArray.forEach(record => {
      const date = record._id
      delete record._id
      recordsHash[date] = record
    })

    return recordsHash
  }
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
  Object.keys(records).sort().forEach((date) => {
    let row = [date]
    fields.forEach((field) => {
      const record = records[date]
      row.push(record[field] || 0)
      row.push(schema[field][record[field] - 1] || '')
    })
    rows.push(row)
  })

  return [headers].concat(rows)
}

module.exports = {
  buildRouter,
  HealthLog,
  transformRecordsToCSV,
  transformRecordsToArray,
}
