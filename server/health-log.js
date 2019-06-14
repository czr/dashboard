const mongodb = require('mongodb')
const csvStringify = require('csv-stringify/lib/sync')

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
  HealthLog,
  transformRecordsToCSV,
  transformRecordsToArray,
}
