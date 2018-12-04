import React from 'react'

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
    return (
      <div className="TimeTracking">
        <div class="text">
          Time: {JSON.stringify(this.state.records)}
        </div>
      </div>
    );
  }
}

export default TimeTracking
