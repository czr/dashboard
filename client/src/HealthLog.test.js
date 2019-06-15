import React from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { combineReducers, createStore } from 'redux'
import HealthLog, { healthLogReducer } from './HealthLog'

const rootReducer = combineReducers({
  healthLog: healthLogReducer,
})
const store = createStore(rootReducer)

it('renders a Component', () => {
  const div = document.createElement('div')
  ReactDOM.render(
    <Provider store={store}>
      <HealthLog />
    </Provider>,
    div,
  )
  const classes = div.children[0].className.split(' ')
  expect(classes).toContain('Component')
  expect(classes).toContain('HealthLog')
  ReactDOM.unmountComponentAtNode(div)
})
