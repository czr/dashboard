import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import './TimeTracking.css'

const moment = require('moment')

const TIME_TRACKING_UPDATE = 'TIME_TRACKING_UPDATE'

const updateTimeTracking = records => ({
  type: TIME_TRACKING_UPDATE,
  records: records,
})

const timeTrackingReducer = (state, action) => {
  switch (action.type) {
    case (TIME_TRACKING_UPDATE):
      return action.records
    default:
      return state || {}
  }
}

class TimeTracking extends React.Component {
  componentDidMount () {
    this.callTimeTracking()
      .then(res => {
        this.props.updateTimeTracking(res)
      })
      .catch(err => console.log(err))
  }

  callTimeTracking = async () => {
    const response = await fetch('/api/time-tracking')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    return body
  }

  render () {
    var records = this.props.records

    var formatDay = function (dateStr) {
      var date = moment(dateStr)
      if (date.isSame(moment().startOf('day'))) {
        return 'Today'
      }
      if (date.isSame(moment().subtract(1, 'days').startOf('day'))) {
        return 'Yesterday'
      }
      return date.format('dddd')
    }

    var formatDuration = function (durationStr) {
      var duration = moment.duration(durationStr)
      return duration.asMinutes() + 'm'
    }

    return (
      <div className='TimeTracking'>
        <h1>Time tracking</h1>
        <div className='tags'>
          {Object.keys(records).sort().map(tag =>
            <div key={tag} className='tag'>
              <h2>{tag}</h2>
              <table className='durations'>
                <tbody>
                  {Object.keys(records[tag]).sort().reverse().map(date =>
                    <tr key={date}>
                      <td className='day'>{formatDay(date)}</td>
                      <td className='duration'>{formatDuration(records[tag][date])}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )
  }
}

TimeTracking.propTypes = {
  records: PropTypes.object.isRequired,
  updateTimeTracking: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  records: state.timeTracking,
})

export { timeTrackingReducer }
export default connect(
  mapStateToProps,
  { updateTimeTracking },
)(TimeTracking)
