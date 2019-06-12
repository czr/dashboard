import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { Line } from 'rc-progress'
import './LifeProgress.css'

const LIFE_PROGRESS_UPDATE = 'LIFE_PROGRESS_UPDATE'

const updateLifeProgress = progress => ({
  type: LIFE_PROGRESS_UPDATE,
  progress: progress,
})

const lifeProgressReducer = (state, action) => {
  switch (action.type) {
    case (LIFE_PROGRESS_UPDATE):
      return action.progress
    default:
      return state || 0
  }
}

class LifeProgress extends React.Component {
  componentDidMount () {
    this.callLifeProgress()
      .then(res => this.props.updateLifeProgress(res['life-progress']))
      .catch(err => console.log(err))
  }

  callLifeProgress = async () => {
    const response = await fetch('/api/life-progress')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    return body
  }

  render () {
    return (
      <div className='LifeProgress'>
        <h1>Life progress</h1>
        <div className='text'>
          {(this.props.lifeProgress * 100).toFixed(0)}%
        </div>
        <Line percent={this.props.lifeProgress * 100} />
      </div>
    )
  }
}

LifeProgress.propTypes = {
  lifeProgress: PropTypes.number.isRequired,
  updateLifeProgress: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  lifeProgress: state.lifeProgress,
})

export { lifeProgressReducer }
export default connect(
  mapStateToProps,
  { updateLifeProgress }
)(LifeProgress)
