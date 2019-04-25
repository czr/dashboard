import React, { Component } from 'react';

import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './App.css';

import LifeProgress from './LifeProgress.js';
import MIT from './MIT.js';
import TimeTracking from './TimeTracking.js';
import HealthLog from './HealthLog.js';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="components">
          <LifeProgress></LifeProgress>
          <TimeTracking></TimeTracking>
          <MIT></MIT>
          <HealthLog></HealthLog>
        </div>

        <ToastContainer
          hideProgressBar
          transition={Zoom}
          closeButton={false}
        />
      </div>
    );
  }
}

export default App;
