import React from 'react'
import './TimeTracking.css'

const moment = require('moment')

class TimeTracking extends React.Component {
  state = {
    records: {},
  };

  componentDidMount() {
    this.callTimeTracking()
      .then(res => this.setState({ records: res }))
      .catch(err => console.log(err));
  }

  callTimeTracking = async () => {
    const response = await fetch('/api/time-tracking');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    var records = this.state.records

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
      <div className="TimeTracking">
        <h1>Time tracking</h1>
        <div className="tags">
          {Object.keys(records).sort().map(tag =>
            <>
              <h2>{tag}</h2>
              <table className="durations">
                {Object.keys(records[tag]).sort().reverse().map(date =>
                  <tr>
                    <td className="day">{formatDay(date)}</td>
                    <td className="duration">{formatDuration(records[tag][date])}</td>
                  </tr>
                )}
              </table>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default TimeTracking
