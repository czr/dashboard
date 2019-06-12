import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'

import './MIT.css'

const MIT_SET_CARDS = 'MIT_SET_CARDS'

const setCards = cards => ({
  type: MIT_SET_CARDS,
  cards: cards,
})

const mitReducer = (state, action) => {
  switch (action.type) {
    case (MIT_SET_CARDS):
      return action.cards
    default:
      return state || []
  }
}

class MIT extends React.Component {
  componentDidMount () {
    this.refreshState()
  }

  notify = (message) => {
    toast.error(message)
  }

  callMIT = async () => {
    const response = await fetch('/api/mit/cards')
    const body = await response.json()
    if (response.status !== 200) throw Error(body.message)
    return body
  }

  markDone = async (e) => {
    const response = await fetch('/api/mit/done', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ card: this.props.cards[0] }),
    })
    const body = await response.json()
    if (response.status !== 200) {
      this.notify(body.error)
    }

    this.refreshState()
  }

  refreshState () {
    this.callMIT()
      .then(res => this.props.setCards(res))
      .catch(err => console.log(err))
  }

  render () {
    return (
      <div className='MIT'>
        <h1>MIT</h1>
        <div className='text'>
          {this.props.cards.length > 0
            ? <table>
              <tbody>
                <tr>
                  <td>
                    <a href={this.props.cards[0].url}
                      target='_blank'
                      rel='noopener noreferrer'
                    >{this.props.cards[0].name}</a>
                  </td>
                  <td className='done'>
                    <button onClick={this.markDone}>Done</button>
                  </td>
                </tr>
              </tbody>
            </table>
            : 'No MIT chosen'
          }
        </div>
      </div>
    )
  }
}

MIT.propTypes = {
  cards: PropTypes.array.isRequired,
  setCards: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  cards: state.mit,
})

export { mitReducer }
export default connect(
  mapStateToProps,
  { setCards },
)(MIT)
