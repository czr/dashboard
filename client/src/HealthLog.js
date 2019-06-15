import ApolloClient from 'apollo-boost'
import gql from 'graphql-tag'
import PropTypes from 'prop-types'
import React from 'react'
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton'
import { connect, ReactReduxContext } from 'react-redux'
import TextModal from './TextModal'
import './HealthLog.css'

const client = new ApolloClient({
  uri: '/api/health-log-graphql',
})
const moment = require('moment')
const later = require('later')

later.date.localTime()

var currentDate = () => {
  return moment().format('YYYY-MM-DD')
}

const HEALTH_LOG_ADD_ATTRIBUTE = 'HEALTH_LOG_ADD_ATTRIBUTE'
const HEALTH_LOG_DELETE_ATTRIBUTE = 'HEALTH_LOG_DELETE_ATTRIBUTE'
const HEALTH_LOG_CHANGE_ATTRIBUTE_VALUE = 'HEALTH_LOG_CHANGE_ATTRIBUTE_VALUE'
const HEALTH_LOG_REPLACE_ATTRIBUTES = 'HEALTH_LOG_REPLACE_ATTRIBUTES'
const HEALTH_LOG_UPDATE_SCHEMA_TEXT = 'HEALTH_LOG_UPDATE_SCHEMA_TEXT'
const HEALTH_LOG_REPLACE_SCHEMA = 'HEALTH_LOG_REPLACE_SCHEMA'
const HEALTH_LOG_SHOW_SCHEMA = 'HEALTH_LOG_SHOW_SCHEMA'
const HEALTH_LOG_HIDE_SCHEMA = 'HEALTH_LOG_HIDE_SCHEMA'
const HEALTH_LOG_CHANGE_EDITING_DATE = 'HEALTH_LOG_CHANGE_EDITING_DATE'
const HEALTH_LOG_CHANGE_DATE_LIST = 'HEALTH_LOG_CHANGE_DATE_LIST'

const addAttribute = (attributeKey, attributeValue) => ({
  type: HEALTH_LOG_ADD_ATTRIBUTE,
  attributeKey: attributeKey,
  attributeValue: attributeValue,
})

const deleteAttribute = (attributeKey) => ({
  type: HEALTH_LOG_DELETE_ATTRIBUTE,
  attributeKey: attributeKey,
})

const changeAttributeValue = (attributeKey, attributeValue) => ({
  type: HEALTH_LOG_CHANGE_ATTRIBUTE_VALUE,
  attributeKey: attributeKey,
  attributeValue: attributeValue,
})

const replaceAttributes = (attributes) => ({
  type: HEALTH_LOG_REPLACE_ATTRIBUTES,
  attributes: attributes,
})

const updateSchemaText = (schemaText) => ({
  type: HEALTH_LOG_UPDATE_SCHEMA_TEXT,
  schemaText: schemaText,
})

const replaceSchema = (schema) => ({
  type: HEALTH_LOG_REPLACE_SCHEMA,
  schema: schema,
})

const showSchema = () => ({
  type: HEALTH_LOG_SHOW_SCHEMA,
})

const hideSchema = () => ({
  type: HEALTH_LOG_HIDE_SCHEMA,
})

const changeEditingDate = (date) => ({
  type: HEALTH_LOG_CHANGE_EDITING_DATE,
  date: date,
})

const changeDateList = (dateList) => ({
  type: HEALTH_LOG_CHANGE_DATE_LIST,
  dateList: dateList,
})

const healthLogReducer = (state, action) => {
  switch (action.type) {
    case (HEALTH_LOG_SHOW_SCHEMA): {
      return Object.assign({}, state, { schemaVisible: true })
    }
    case (HEALTH_LOG_HIDE_SCHEMA): {
      return Object.assign({}, state, { schemaVisible: false })
    }
    case (HEALTH_LOG_ADD_ATTRIBUTE): {
      let attribute = action.attributeKey
      let updatedAttributes = Object.assign({}, state.attributes)
      updatedAttributes[attribute] = 1
      return Object.assign({}, state, { attributes: updatedAttributes })
    }
    case (HEALTH_LOG_DELETE_ATTRIBUTE): {
      let attribute = action.attributeKey
      let updatedAttributes = Object.assign({}, state.attributes)
      delete updatedAttributes[attribute]
      return Object.assign({}, state, { attributes: updatedAttributes })
    }
    case (HEALTH_LOG_CHANGE_ATTRIBUTE_VALUE): {
      let attribute = action.attributeKey
      let value = action.attributeValue
      let attributes = state.attributes
      let updatedAttributes = { ...attributes, [attribute]: value }
      return Object.assign({}, state, { attributes: updatedAttributes })
    }
    case (HEALTH_LOG_REPLACE_ATTRIBUTES): {
      return Object.assign({}, state, { attributes: action.attributes })
    }
    case (HEALTH_LOG_REPLACE_SCHEMA): {
      const schema = action.schema
      return Object.assign({}, state, {
        schema: schema,
        schemaText: JSON.stringify(schema, null, 2),
        isSchemaTextValid: true,
      })
    }
    case (HEALTH_LOG_UPDATE_SCHEMA_TEXT): {
      const schemaText = action.schemaText
      let valid = false
      try {
        JSON.parse(schemaText)
        valid = true
      } catch {
        valid = false
      }
      return Object.assign({}, state, {
        schemaText: schemaText,
        isSchemaTextValid: valid,
      })
    }
    case (HEALTH_LOG_CHANGE_EDITING_DATE): {
      return Object.assign({}, state, { editingDate: action.date })
    }
    case (HEALTH_LOG_CHANGE_DATE_LIST): {
      return Object.assign({}, state, { dateList: action.dateList })
    }
    default: {
      return state || {
        schemaVisible: false,
        editingDate: null,
        dateList: [],
        attributes: {},
        schema: {},
        schemaText: '',
        isSchemaTextValid: false,
      }
    }
  }
}

function MinusButton (props) {
  return (
    <button {...props} className='MinusButton'>－</button>
  )
}

class HealthLog extends React.Component {
  static contextType = ReactReduxContext
  refreshTimer = undefined

  componentDidMount () {
    const date = currentDate()
    this.props.changeEditingDate(date)
    this.fetchDayRecord(date)
      .then(res => {
        this.props.replaceAttributes(res)
      })
      .catch(err => console.log(err))

    this.fetchSchema()
      .then(res => {
        this.props.replaceSchema(res)
      })
      .catch(err => console.log(err))

    this.refreshDateList()

    this.refreshTimer = later.setInterval(
      () => {
        const date = currentDate()
        this.refreshDateList()
        this.props.changeEditingDate(date)
        this.fetchDayRecord(date)
          .then(res => {
            this.props.replaceAttributes(res)
          })
          .catch(err => console.log(err))
      },
      later.parse.cron('0 4 * * * *'),
    )
  }

  componentWillUnmount () {
    this.refreshTimer.clear()
  }

  refreshDateList = () => {
    this.props.changeDateList(
      Array(7).fill().map((_, i) => {
        return moment().subtract(i, 'days').format('YYYY-MM-DD')
      }),
    )
  }

  fetchDayRecord = async (date) => {
    const res = await client.query({
      query: gql`
        query getDay($date: Date) {
          day(date: $date) {
            date
            symptoms {
              name
              level
            }
          }
        }
      `,
      variables: {
        date: date,
      },
      fetchPolicy: 'no-cache',
    })

    const symptoms = {}
    for (let symptom of res.data.day.symptoms) {
      symptoms[symptom.name] = symptom.level
    }

    return symptoms
  }

  fetchSchema = async () => {
    const res = await client.query({
      query: gql`
        query getSchema {
          schema {
            symptomSchemas {
              name
              levels
            }
          }
        }
      `,
      fetchPolicy: 'no-cache',
    })

    const schema = {}
    for (let symptomSchema of res.data.schema.symptomSchemas) {
      schema[symptomSchema.name] = symptomSchema.levels
    }

    return schema
  }

  attributeValues (attribute) {
    if (this.props.schema[attribute]) {
      return this.props.schema[attribute]
    }
    return []
  }

  formatValue (attribute, value) {
    if (this.props.schema[attribute]) {
      return this.props.schema[attribute][value - 1]
    }
    return value
  }

  handleDateChange = (event) => {
    const date = event.target.value

    this.props.changeEditingDate(date)
    this.fetchDayRecord(date)
      .then(res => {
        this.props.replaceAttributes(res)
      })
      .catch(err => console.log(err))
  }

  saveAttributesToServer = () => {
    // Need to use attributes from store because the version in props is only
    // updated asynchronously, and we don't have a hook from dispatching the
    // update action to the store to the values being updated in props.
    let attributes = this.context.store.getState().healthLog.attributes
    let date = this.props.editingDate

    const symptoms = []
    for (let symptomName of Object.keys(attributes)) {
      symptoms.push({
        name: symptomName,
        level: attributes[symptomName],
      })
    }
    const day = {
      date: date,
      symptoms: symptoms,
    }

    client.mutate({
      mutation: gql`
        mutation updateDay($day: DayInput) {
          updateDay(day: $day) {
            date
            symptoms {
              name
              level
            }
          }
        }
      `,
      variables: {
        day: day,
      },
    })
  }

  handleAttributeChange = (event) => {
    let attribute = event.target.name
    let value = Number(event.target.value)
    this.props.changeAttributeValue(attribute, value)
    this.saveAttributesToServer()
  }

  handleAttributeDelete = (event) => {
    let attribute = event.target.value
    this.props.deleteAttribute(attribute)
    this.saveAttributesToServer()
  }

  handleAttributeAdd = (value) => {
    let attribute = value
    this.props.addAttribute(attribute)
    this.saveAttributesToServer()
  }

  handleSchemaTextChange = (event) => {
    const schemaText = event.target.value
    this.props.updateSchemaText(schemaText)
  }

  handleUpdateSchema = (event) => {
    const schemaText = this.props.schemaText
    try {
      const schema = JSON.parse(schemaText)

      const symptomSchemas = []
      for (let symptomName of Object.keys(schema)) {
        symptomSchemas.push({
          name: symptomName,
          levels: schema[symptomName],
        })
      }

      this.props.replaceSchema(schema)
      client.mutate({
        mutation: gql`
          mutation updateSchema($schema: SchemaInput) {
            updateSchema(schema: $schema) {
              symptomSchemas {
                name
                levels
              }
            }
          }
        `,
        variables: {
          schema: { symptomSchemas },
        },
      })
    } catch (err) {
      console.log(err)
    }
    this.props.hideSchema()
  }

  handleOpenSchema = (event) => {
    this.props.showSchema()
  }

  handleCloseSchema = (event) => {
    this.props.hideSchema()
  }

  render () {
    var attributes = this.props.attributes

    const menuItemElements = Object.keys(this.props.schema).map((attribute, i) => {
      return (
        <li className='AriaMenuButton-menuItemWrapper' key={i}>
          <MenuItem className='AriaMenuButton-menuItem' value={attribute} text={attribute}>
            {attribute}
          </MenuItem>
        </li>
      )
    })

    return (
      <div className='HealthLog Component'>
        <h1>Health</h1>

        <div className='Component-rowFixed'>
          <table className='day'>
            <tbody>
              <tr>
                <td>
                  Day
                </td>
                <td>
                  <select value={this.props.editingDate} onChange={this.handleDateChange}>
                    {this.props.dateList.map((date) =>
                      <option value={date} key={date}>{date}</option>
                    )}
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className='Component-rowExpandable'>
          <table className='attributes'>
            <tbody>
              {Object.keys(attributes).sort().map(attribute =>
                <tr key={attribute}>
                  <td className='attribute'>{attribute}</td>
                  <td className='value'>
                    <div className='select'>
                      <select name={attribute} onChange={this.handleAttributeChange}>
                        {this.attributeValues(attribute).map((value, index) =>
                          <option value={index + 1} key={index + 1} selected={index + 1 === attributes[attribute]}>{value}</option>
                        )}
                      </select>
                    </div>
                  </td>
                  <td className='delete'>
                    <MinusButton
                      value={attribute}
                      onClick={this.handleAttributeDelete}
                    />
                  </td>
                </tr>
              )}
              <tr>
                <td className='add' colSpan='3'>
                  <Wrapper
                    className='AriaMenuButton'
                    onSelection={this.handleAttributeAdd}
                  >
                    <Button
                      tag='button'
                      className='AriaMenuButton-trigger PlusButton'
                    >
                      ＋
                    </Button>
                    <Menu>
                      <ul className='AriaMenuButton-menu'>{menuItemElements}</ul>
                    </Menu>
                  </Wrapper>
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        <div className='Component-rowFixed schema-link'>
          <small>
            <button className='link-button' onClick={this.handleOpenSchema}>
              Schema
            </button>
          </small>
        </div>

        <TextModal
          isOpen={this.props.schemaVisible}
          text={this.props.schemaText}
          isValid={this.props.isSchemaTextValid}
          handleClose={this.handleCloseSchema}
          handleUpdate={this.handleUpdateSchema}
          handleChange={this.handleSchemaTextChange}
        />
      </div>
    )
  }
}

HealthLog.propTypes = {
  // data
  schemaVisible: PropTypes.bool.isRequired,
  editingDate: PropTypes.string.isRequired,
  dateList: PropTypes.array.isRequired,
  attributes: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  schemaText: PropTypes.string.isRequired,
  isSchemaTextValid: PropTypes.bool.isRequired,

  // functions
  showSchema: PropTypes.func.isRequired,
  hideSchema: PropTypes.func.isRequired,
  changeEditingDate: PropTypes.func.isRequired,
  changeDateList: PropTypes.func.isRequired,
  replaceAttributes: PropTypes.func.isRequired,
  changeAttributeValue: PropTypes.func.isRequired,
  addAttribute: PropTypes.func.isRequired,
  deleteAttribute: PropTypes.func.isRequired,
  updateSchemaText: PropTypes.func.isRequired,
  replaceSchema: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => (state.healthLog)

export { healthLogReducer }
export default connect(
  mapStateToProps,
  {
    showSchema,
    hideSchema,
    changeEditingDate,
    changeDateList,
    replaceAttributes,
    changeAttributeValue,
    addAttribute,
    deleteAttribute,
    updateSchemaText,
    replaceSchema,
  },
)(HealthLog)
