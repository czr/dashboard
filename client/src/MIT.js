import React from 'react'
import { toast } from 'react-toastify'

import './MIT.css'

class MIT extends React.Component {
  state = {
    mitCards: [],
  };

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
  };

  markDone = async (e) => {
    const response = await fetch('/api/mit/done', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ card: this.state.mitCards[0] }),
    })
    const body = await response.json()
    if (response.status !== 200) {
      this.notify(body.error)
    }

    this.refreshState()
  }

  refreshState () {
    this.callMIT()
      .then(res => this.setState({ mitCards: res }))
      .catch(err => console.log(err))
  }

  render () {
    return (
      <div className='MIT'>
        <h1>MIT</h1>
        <div className='text'>
          {this.state.mitCards.length > 0
            ? <>
              <p>
                <a href={this.state.mitCards[0].url}
                  target='_blank'
                  rel='noopener noreferrer'
                >{this.state.mitCards[0].name}</a>
              </p>
              <button onClick={this.markDone}>Done</button>
            </>
            : 'No MIT chosen'
          }
        </div>
      </div>
    )
  }
}

export default MIT
