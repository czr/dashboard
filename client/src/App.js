import React, { Component } from 'react';
import './App.css';
import LifeProgress from './LifeProgress.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <LifeProgress></LifeProgress>
      </div>
    );
  }
}

export default App;
