import React from 'react'
import './HealthLog.css'
import { Wrapper, Button, Menu, MenuItem } from 'react-aria-menubutton';

const moment = require('moment')
const later = require('later')

later.date.localTime()

var fetchJson = async (url) => {
  const response = await fetch(url)
  const body = await response.json()
  if (response.status !== 200) throw Error(body.message)
  return body
}

var fetchJsonAllowing404 = async (url) => {
  const response = await fetch(url)

  if (response.ok) {
    return await response.json()
  }

  if (response.status === 404) {
    return null
  }

  throw Error((await response.json()).message)
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
  if (!response.ok) {
    const body = await response.json()
    throw Error(body.message)
  }
}

var currentDate = () => {
  return moment().format('YYYY-MM-DD')
}

class HealthLog extends React.Component {
  refreshTimer = undefined

  state = {
    attributes: {},
    schema: {},
    editingDate: currentDate(),
    dateList: [],
  }

  componentDidMount() {
    this.fetchDayRecord(this.state.editingDate)
      .then(res => this.setState({ attributes: res }))
      .catch(err => console.log(err))

    this.fetchSchema()
      .then(res => this.setState({ schema: res }))
      .catch(err => console.log(err))

    this.refreshDateList()

    this.refreshTimer = later.setInterval(
      () => {
        const date = currentDate()
        this.refreshDateList()
        this.setState({
          editingDate: date
        })
        this.fetchDayRecord(date)
          .then(res => this.setState({ attributes: res }))
          .catch(err => console.log(err))
      },
      later.parse.cron('0 4 * * * *'),
    )
  }

  componentWillUnmount() {
    this.refreshTimer.clear()
  }

  refreshDateList = () => {
    this.setState({
      dateList: Array(7).fill().map((_, i) => {
        return moment().subtract(i, 'days').format('YYYY-MM-DD')
      }),
    })
  }

  fetchDayRecord = async (date) => {
    return await fetchJsonAllowing404(`/api/health-log/days/${date}`) || {}
  }

  fetchSchema = async () => {
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

  handleDateChange(event) {
    const date = event.target.value

    this.setState({editingDate: date})
    this.fetchDayRecord(date)
      .then(res => this.setState({ attributes: res }))
      .catch(err => console.log(err))
  }

  handleAttributeChange(event) {
    let attribute = event.target.name
    let value = Number(event.target.value)
    let attributes = this.state.attributes

    this.setState(
      { attributes: { ...attributes, [attribute]: value } },
      () => {
        let date = this.state.editingDate
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
        let date = this.state.editingDate
        putJson(`/api/health-log/days/${date}`, this.state.attributes)
      }
    )
  }

  handleAdd(value) {
    let attribute = value
    let updatedAttributes = Object.assign({}, this.state.attributes)

    updatedAttributes[attribute] = 1

    this.setState(
      { attributes: updatedAttributes },
      () => {
        let date = this.state.editingDate
        putJson(`/api/health-log/days/${date}`, this.state.attributes)
      }
    )
  }

  render() {
    var attributes = this.state.attributes

    const menuItemElements = Object.keys(this.state.schema).map((attribute, i) => {
      return (
        <li className="AriaMenuButton-menuItemWrapper" key={i}>
          <MenuItem className="AriaMenuButton-menuItem" value={attribute} text={attribute}>
            {attribute}
          </MenuItem>
        </li>
      );
    });

    return (
      <div className="HealthLog">
        <h1>Health</h1>

        <div className="select">
          <select value={this.state.editingDate} onChange={this.handleDateChange.bind(this)}>
            {this.state.dateList.map((date) =>
             <option value={date} key={date}>{date}</option>
            )}
          </select>
        </div>

        <table className="attributes">
          <tbody>
            {Object.keys(attributes).sort().map(attribute =>
              <tr key={attribute}>
                <td className="attribute">{attribute}</td>
                <td className="value">
                  <div className="select">
                    <select name={attribute} onChange={this.handleAttributeChange.bind(this)}>
                      {this.attributeValues(attribute).map((value, index) =>
                        <option value={index + 1} key={index + 1} selected={index + 1 === attributes[attribute]}>{value}</option>
                      )}
                    </select>
                  </div>
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

        <Wrapper
          className="AriaMenuButton"
          onSelection={this.handleAdd.bind(this)}
        >
          <Button tag="button" className="AriaMenuButton-trigger">
            Add
          </Button>
          <Menu>
            <ul className="AriaMenuButton-menu">{menuItemElements}</ul>
          </Menu>
        </Wrapper>
      </div>
    );
  }
}

export default HealthLog
