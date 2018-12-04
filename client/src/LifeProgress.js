import React from 'react'
import { Line } from 'rc-progress'
import './LifeProgress.css'

class LifeProgress extends React.Component {
  state = {
    lifeProgress: 0,
  };

  componentDidMount() {
    this.callLifeProgress()
      .then(res => this.setState({ lifeProgress: res['life-progress'] }))
      .catch(err => console.log(err));
  }

  callLifeProgress = async () => {
    const response = await fetch('/api/life-progress');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="LifeProgress">
        <div class="text">
          Life Progress: {(this.state.lifeProgress * 100).toFixed(0)}%
        </div>
        <Line percent={this.state.lifeProgress * 100}></Line>
      </div>
    );
  }
}

export default LifeProgress
