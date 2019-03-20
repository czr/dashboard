import React from 'react'
import './HealthLog.css'

const moment = require('moment')

var fetchJson = async (url) => {
  const response = await fetch(url)
  const body = await response.json()
  if (response.status !== 200) throw Error(body.message)
  return body;
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

  callHealthLog = async () => {
    return fetchJson('/api/health-log/days/2019-03-20')
  }

  callSchema = async () => {
    return fetchJson('/api/health-log/schema')
  }

  formatValue(attribute, value) {
    if (this.state.schema[attribute]) {
      return this.state.schema[attribute][value]
    }
    return value
  }

  render() {
    var attributes = this.state.attributes

    return (
      <div className="HealthLog">
        <h1>Health</h1>
        <table className="attributes">
          {Object.keys(attributes).sort().map(attribute =>
            <tr>
              <td className="attribute">{attribute}</td>
              <td className="value">{this.formatValue(attribute, attributes[attribute])}</td>
            </tr>
          )}
        </table>
      </div>
    );
  }
}

export default HealthLog
