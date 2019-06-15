const express = require('express')
const graphqlHTTP = require('express-graphql')
var { GraphQLScalarType, GraphQLError } = require('graphql')
var { makeExecutableSchema } = require('graphql-tools')
const { HealthLog } = require('./health-log')
const moment = require('moment')

function transformSymptomsObjectToArray (symptomsObject, schema) {
  const symptomsArray = []
  for (let key of Object.keys(symptomsObject)) {
    symptomsArray.push({
      name: key,
      level: symptomsObject[key],
      levelDescription: schema[key][symptomsObject[key] - 1],
    })
  }
  return symptomsArray
}

function transformSymptomsArrayToObject (symptomsArray) {
  const symptomsObject = {}
  for (let symptom of symptomsArray) {
    symptomsObject[symptom.name] = symptom.level
  }
  return symptomsObject
}

const dateRegexp = new RegExp('\\d{4}-\\d{2}-\\d{2}')
const isDate = (value) => {
  if (
    (typeof value !== 'string') ||
    (!dateRegexp.test(value)) ||
    (!moment(value).isValid())
  ) {
    throw new GraphQLError(`Value passed (${value}) is not a Date`)
  }

  return value
}

const GQLDate = new GraphQLScalarType({
  name: 'Date',
  description: 'A YYYY-MM-DD Date Scalar',
  serialize: value => isDate(value),
})

function buildRouter (options) {
  const healthLog = new HealthLog(options.mongodbUrl)
  const router = new express.Router()

  const typeDefs = `
    scalar Date

    type Day {
      date: Date!
      symptoms: [Symptom!]!
    }

    type Symptom {
      name: String!
      level: Int!
      levelDescription: String
    }

    type Schema {
      symptomSchemas: [SymptomSchema!]!
    }

    type SymptomSchema {
      name: String!
      levels: [String!]!
    }

    input DayInput {
      date: Date!
      symptoms: [SymptomInput!]!
    }

    input SymptomInput {
      name: String!
      level: Int!
    }

    input SchemaInput {
      symptomSchemas: [SymptomSchemaInput!]!
    }

    input SymptomSchemaInput {
      name: String!
      levels: [String!]!
    }

    type Query {
      day(date: Date): Day
      schema: Schema
    }

    type Mutation {
      updateDay(day: DayInput): Day
      updateSchema(schema: SchemaInput): Schema
    }
  `

  var resolvers = {
    Date: GQLDate,
    Query: {
      day: async (_, { date }) => {
        const dayRecord = await healthLog.getDay(date)
        const schema = await healthLog.getSchema()

        if (dayRecord) {
          return {
            date: date,
            symptoms: transformSymptomsObjectToArray(dayRecord, schema),
          }
        } else {
          return {
            date: date,
            symptoms: [],
          }
        }
      },
      schema: async () => {
        const schema = await healthLog.getSchema()
        const symptomSchemas = []
        for (let symptomName of Object.keys(schema)) {
          symptomSchemas.push({
            name: symptomName,
            levels: schema[symptomName],
          })
        }
        return { symptomSchemas }
      },
    },
    Mutation: {
      updateDay: async (_, { day }) => {
        const symptoms = transformSymptomsArrayToObject(day.symptoms)
        await healthLog.setDay(day.date, symptoms)
        const schema = await healthLog.getSchema()
        const dayRecord = await healthLog.getDay(day.date)
        if (dayRecord) {
          return {
            date: day.date,
            symptoms: transformSymptomsObjectToArray(dayRecord, schema),
          }
        } else {
          throw new Error(
            'Could not fetch day record after creating it: ' + day.date
          )
        }
      },
      updateSchema: async (_, { schema }) => {
        const symptomLevels = {}
        for (let symptomSchema of schema.symptomSchemas) {
          symptomLevels[symptomSchema.name] = symptomSchema.levels
        }
        healthLog.setSchema(symptomLevels)
        return schema
      },
    },
  }

  const healthLogSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  router.use('/', graphqlHTTP({
    schema: healthLogSchema,
    graphiql: true,
  }))

  return router
}

module.exports = {
  buildRouter,
}
