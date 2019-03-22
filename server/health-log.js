/**
 * Endpoints for managing a health log. Exports an Express router with the
 * following endpoints.
 *
 * @module
 */

const express = require('express')
const router = new express.Router()
const mongodb = require('mongodb')

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
    const client = new mongodb.MongoClient(process.env.MONGODB_URL)

    await client.connect();

    const db = client.db('health_log');
    const collection = db.collection('config')

    var schema = await collection.findOne({ _id: 'schema' })
    if (schema) {
      delete schema['_id']
      res.json(schema)
    }
    else {
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
    const client = new mongodb.MongoClient(process.env.MONGODB_URL)

    await client.connect();

    const db = client.db('health_log');
    const collection = db.collection('config')

    const result = await collection.replaceOne(
      {
        "_id": 'schema',
      },
      {
        ...req.body,
        "_id": 'schema',
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
    const client = new mongodb.MongoClient(process.env.MONGODB_URL)

    await client.connect();

    const db = client.db('health_log');
    const collection = db.collection('days')

    var dayRecord = await collection.findOne({ _id: req.params.date })
    if (dayRecord) {
      delete dayRecord['_id']
      res.json(dayRecord)
    }
    else {
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
    const client = new mongodb.MongoClient(process.env.MONGODB_URL)

    await client.connect();

    const db = client.db('health_log');
    const collection = db.collection('days')

    const result = await collection.replaceOne(
      {
        "_id": req.params.date,
      },
      {
        ...req.body,
        "_id": req.params.date,
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

module.exports = router
