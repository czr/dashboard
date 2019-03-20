import React from 'react'
import './HealthLog.css'

const moment = require('moment')

var fetchJson = async (url) => {
  const response = await fetch(url)
  const body = await response.json()
  if (response.status !== 200) throw Error(body.message)
  return body
}

var putJson = async (url, data) => {
  const response = await fetch(
    url,
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: new Headers({
        'Content-Type': 'application/json'
      }),
    }
  )
  if (response.status >= 300) {
    const body = await response.json()
    throw Error(body.message)
  }
}

class HealthLog extends React.Component {
  state = {
    attributes: {},
    schema: {},
  }

  componentDidMount() {
    this.callHealthLog()
      .then(res => this.setState({ attributes: res }))
      .catch(err => console.log(err))

    this.callSchema()
      .then(res => this.setState({ schema: res }))
      .catch(err => console.log(err))
  }

  currentDate = () => {
    return moment().format('YYYY-MM-DD')
  }

  callHealthLog = async () => {
    let date = this.currentDate()
    return fetchJson(`/api/health-log/days/${date}`)
  }

  callSchema = async () => {
    return fetchJson('/api/health-log/schema')
  }

  attributeValues(attribute) {
    if (this.state.schema[attribute]) {
      return this.state.schema[attribute]
    }
    return []
  }

  formatValue(attribute, value) {
    if (this.state.schema[attribute]) {
      return this.state.schema[attribute][value - 1]
    }
    return value
  }

  handleAttributeChange(event) {
    let attribute = event.target.name
    let value = Number(event.target.value)
    let attributes = this.state.attributes

    this.setState(
      { attributes: { ...attributes, [attribute]: value } },
      () => {
        let date = this.currentDate()
        putJson(`/api/health-log/days/${date}`, this.state.attributes)
      }
    )
  }

  handleAttributeDelete(event) {
    let attribute = event.target.value
    let updatedAttributes = Object.assign({}, this.state.attributes)

    delete updatedAttributes[attribute]

    this.setState(
      { attributes: updatedAttributes },
      () => {
        let date = this.currentDate()
        putJson(`/api/health-log/days/${date}`, this.state.attributes)
      }
    )
  }

  render() {
    var attributes = this.state.attributes

    return (
      <div className="HealthLog">
        <h1>Health</h1>
        <table className="attributes">
          <tbody>
            {Object.keys(attributes).sort().map(attribute =>
              <tr key={attribute}>
                <td className="attribute">{attribute}</td>
                <td className="value">
                  <select name={attribute} onChange={this.handleAttributeChange.bind(this)}>
                    {this.attributeValues(attribute).map((value, index) =>
                      <option value={index + 1} key={index + 1} selected={index + 1 === attributes[attribute]}>{value}</option>
                    )}
                  </select>
                </td>
                <td className="delete">
                  <button value={attribute} onClick={this.handleAttributeDelete.bind(this)}>
                    Delete
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default HealthLog
