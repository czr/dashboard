import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'

import { ToastContainer, Zoom } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import './App.css'

import LifeProgress, { lifeProgressReducer } from './LifeProgress.js'
import MIT, { mitReducer } from './MIT.js'
import TimeTracking, { timeTrackingReducer } from './TimeTracking.js'
import HealthLog from './HealthLog.js'

const rootReducer = combineReducers({
  lifeProgress: lifeProgressReducer,
  mit: mitReducer,
  timeTracking: timeTrackingReducer,
})
const store = createStore(rootReducer)

class App extends Component {
  render () {
    return (
      <Provider store={store}>
        <div className='App'>
          <div className='components'>
            <LifeProgress />
            <TimeTracking />
            <MIT />
            <HealthLog />
          </div>

          <ToastContainer
            hideProgressBar
            transition={Zoom}
            closeButton={false}
          />
        </div>
      </Provider>
    )
  }
}

export default App
