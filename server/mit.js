const beeminder = require('beeminder-js')
const trello = require('./trello')

class MIT {
  constructor(opts) {
    this.trelloTaskList       = opts.trelloTaskList
    this.trelloDoneList       = opts.trelloDoneList
    this.trelloLabel          = opts.trelloLabel
    this.trelloKey            = opts.trelloKey
    this.trelloToken          = opts.trelloToken
    this.goal                 = opts.goal
  }

  async done(cardId, cardName) {
    await this.goal.createDatapoint({
      value: 1,
      comment: cardName,
    })
    await trello.moveCard(
      cardId,
      this.trelloDoneList,
      this.trelloKey,
      this.trelloToken,
    )
  }

  async getMITs() {
    const listCards = await trello.getCards(
      this.trelloTaskList,
      this.trelloKey,
      this.trelloToken,
    )

    var mitCards = listCards.filter(
      card => card.idLabels.includes(this.trelloLabel)
    )
    return mitCards
  }
}

module.exports = MIT
