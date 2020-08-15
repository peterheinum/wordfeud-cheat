const { getCombinationsForHand } = require('./utils/getCombinationsForHand')
const { wordHashMap } = require('./utils/wordlistHashMap')
const { mockPossibleWords } = require('./utils/structures')
const game = require('../game')
const {
  tileDirection,
  getValueOfWords,
  getBoardFromTiles,
  getWordsFromBoard
} = require('./utils/helpers')
const { path } = require('ramda')

const splitDot = key => key.split('.').length 
  ? [...key.split('.')]
  : key

const get = key => obj => typeof splitDot(key) == 'object' 
  ? path(splitDot(key), obj) 
  : obj[key]

const state = {}

const getCordsOfIntersections = (boardWord, word) => boardWord.filter(({letter}) => word.includes(letter))

const findStartsForWord = wordsOnBoard => word => {
  /* Take out the words that contain letters included in the word we are trying to accomplish,
  also give it direction */
  return wordsOnBoard
    .filter(boardWord => boardWord
      .filter(x => word.includes(x.letter).length))
      .map(boardWord => ({ 
        boardWord, 
        coordsOfStart: getCordsOfIntersections(boardWord, word), 
        direction: tileDirection(boardWord), 
        wordToCreate: word 
      }))
}

const createSolution = game => {
  const board = getBoardFromTiles(game.tiles)
  const lettersOnBoard = game.tiles.map(([_, __, letter]) => letter)
  const user = game.players.find(player => player.is_local)
  const { rack } = user
  const lettersAndRack = [...rack, ...lettersOnBoard]
  //// this takes two minutes what the fuck
  // const combinationsOfHand = getCombinationsForHand(lettersAndRack).map(arrToString)

  // const possibleWords = []
  // for (let i = 0; i < combinationsOfHand.length; i++) {
  //   const word = combinationsOfHand[i]
  //   wordHashMap[word] && possibleWords.push(word) 
  // }

  // const wordsWithValue = getValueOfWords(possibleWords)

  const wordsWithValue = mockPossibleWords.map(get('word'))

  const wordsOnBoard = getWordsFromBoard(board)

  const wordsToCreateWithIntersection = wordsWithValue.map(findStartsForWord(wordsOnBoard))
  console.log(wordsToCreateWithIntersection)
}



createSolution(game)

module.exports = {
  createSolution
}
