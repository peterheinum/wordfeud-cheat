const express = require('express')
const path = require('path')
const app = express()
const bodyParser = require('body-parser')
const { loginAndGetGames, getGame } = require('./utils/wfApiHelper')
const { createSolution } = require('./index')

const PORT = process.env.PORT || 3000

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({
  extended: true
}))

const createPath = file => path.join(`${__dirname}/public/${file}`)

app.get('/', (req, res) => {
  res.sendFile(createPath('index.html'))
})

app.post('/login', (req, res) => {
  loginAndGetGames().then(response => res.send(response))
})

app.get('/game/:id/:email', (req, res) => {
  const { id, email } = req.params
  getGame(id, email).then(createSolution)
})

app.listen(PORT)
console.log(PORT,'live')