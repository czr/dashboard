import React from 'react'
import './MIT.css'

class MIT extends React.Component {
  state = {
    mitCards: [],
  };

  componentDidMount() {
    this.callMIT()
      .then(res => this.setState({ mitCards: res }))
      .catch(err => console.log(err));
  }

  callMIT = async () => {
    const response = await fetch('/api/mit');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
    return (
      <div className="MIT">
        <h1>MIT</h1>
        <div className="text">
          {this.state.mitCards.length > 0 ?
            this.state.mitCards[0].name
            :
            'No MIT chosen'
          }
        </div>
      </div>
    );
  }
}

export default MIT
