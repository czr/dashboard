import React, { Component } from 'react';
import './App.css';
import LifeProgress from './LifeProgress.js';
import TimeTracking from './TimeTracking.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <LifeProgress></LifeProgress>
        <TimeTracking></TimeTracking>
      </div>
    );
  }
}

export default App;
