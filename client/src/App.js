import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    lifeProgress: 0,
  };

  componentDidMount() {
    this.callLifeProgress()
      .then(res => this.setState({ lifeProgress: res['life-progress'] }))
      .catch(err => console.log(err));
  }

  callLifeProgress = async () => {
    const response = await fetch('/api/life-progress.json');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="App">
        <p>{this.state.lifeProgress * 100}</p>
      </div>
    );
  }
}

export default App;
