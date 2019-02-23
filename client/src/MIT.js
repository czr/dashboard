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
    const response = await fetch('/api/trello/mit');
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
            <a href={this.state.mitCards[0].url}
              target="_blank"
              rel="noopener noreferrer"
            >{this.state.mitCards[0].name}</a>
            :
            'No MIT chosen'
          }
        </div>
      </div>
    );
  }
}

export default MIT
