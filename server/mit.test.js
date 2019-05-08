'use strict'

const MIT = require('./mit')

jest.mock('./trello')
const trello = require('./trello')

describe('MIT endpoint', () => {
  const goal = {
    createDatapoint: jest.fn(),
  }

  const mit = new MIT({
    trelloTaskList: '1234',
    trelloDoneList: '4567',
    trelloLabel: '8901',
    trelloKey: 'dummy-key',
    trelloToken: 'dummy-token',
    goal: goal,
  })

  describe('moveCard()', () => {
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('creates datapoints and moves cards', async () => {
      goal.createDatapoint.mockResolvedValueOnce({
        id: 'foo',
        value: 1,
        comment: 'Test card',
      })

      trello.moveCard.mockResolvedValueOnce({
        response: {
          status: 200,
        },
      })

      const cardId = 'abcd'
      const cardName = 'Test card'
      await mit.done(cardId, cardName)
      expect(goal.createDatapoint).toHaveBeenCalledWith({ value: 1, comment: 'Test card' })
      expect(trello.moveCard).toHaveBeenCalledWith(cardId, '4567', 'dummy-key', 'dummy-token')
    })

    it('returns Beeminder errors', async () => {
      goal.createDatapoint.mockRejectedValueOnce({
        name: 'AuthError',
        message: 'Not authorised',
      })

      trello.moveCard.mockResolvedValueOnce({
        response: {
          status: 200,
        },
      })

      const cardId = 'abcd'
      const cardName = 'Test card'
      expect.assertions(3)
      try {
        await mit.done(cardId, cardName)
      } catch (err) {
        expect(err.name).toEqual('AuthError')
        expect(goal.createDatapoint).toHaveBeenCalledWith({ value: 1, comment: 'Test card' })
        expect(trello.moveCard).not.toHaveBeenCalled()
      }
    })
  })

  describe('getMITs()', () => {
    it('returns MITs', async () => {
      trello.getCards.mockResolvedValueOnce([
        {
          id: '1',
          idLabels: [],
          name: 'Test Card 1',
        },
        {
          id: '2',
          idLabels: ['8901'],
          name: 'Test Card 2',
        },
      ])

      const cards = await mit.getMITs()
      expect(trello.getCards).toHaveBeenCalledWith('1234', 'dummy-key', 'dummy-token')
      expect(cards.length).toEqual(1)
      expect(cards[0].name).toEqual('Test Card 2')
    })
  })
})
