require('dotenv').config()
const WordFeudApiClass = require('wordfeud-api')
const { reject } = require('ramda')
const wordFeudApi = new WordFeudApiClass()

const currentSessionId = {}

const setCurrentSessionId = ({ email, sessionId }) => {
  currentSessionId[email] = sessionId
  return Promise.resolve()
}

const login = (email, pass) => {
  return new Promise((resolve, reject) => {
    wordFeudApi.login(email, pass,
      (err, result) => err
        ? reject(err)
        : setCurrentSessionId({email, ...result }).then(() => resolve(result)))
  })
}

const getGames = ({ sessionId }) => new Promise((resolve, reject) => {
  wordFeudApi.getGames(sessionId,
    (err, result) => err
      ? reject(err)
      : resolve(result))
})

const logMeIn = () => login(process.env.EMAIL, process.env.PASSWORD)

// logMeIn().then(getGames).then().then(console.log)
const getGame = (id, email) => {
  const sessionId = currentSessionId[email]
  return new Promise((resolve, reject) => wordFeudApi.getGame(id, sessionId,
    (err, result) => err
      ? reject(err)
      : resolve(result))
  )
}

const loginAndGetGames = () => logMeIn().then(getGames)
// const loginAndGetGames = (email, pass) => login(email, pass).then(getGames)

module.exports = { loginAndGetGames, getGame }
