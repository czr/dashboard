const express = require('express')
const router = new express.Router()
const mongodb = require('mongodb')

router.get('/schema', async (req, res) => {
  res.json(
    {
      "Nasal congestion": ["Mild", "Moderate", "Severe"],
      "Sore throat": ["Inflamed", "Mild", "Moderate", "Severe"],
    }
  )
})

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
