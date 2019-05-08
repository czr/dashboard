'use strict'

const axios = require('axios')

const apiBase = 'https://api.trello.com/1/'

async function getCards (list, key, token) {
  var url = `${apiBase}lists/${list}/cards?key=${key}&token=${token}`
  var response = await axios.get(url)

  return response.data
}

async function moveCard (card, list, key, token) {
  var url = `${apiBase}cards/${card}/?key=${key}&token=${token}`
  return axios.put(url, {
    idList: list,
    pos: 'bottom',
  })
}

module.exports = { getCards, moveCard }
