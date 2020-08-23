const { getCombinationsForHand } = require('./utils/getCombinationsForHand')
const { wordHashMap } = require('./utils/wordlistHashMap')
const { mockPossibleWords } = require('./utils/structures')
const game = require('../game')
const {
  createHashBoard,
  getDirectionForNewWord,
  getValueOfWords,
  getBoardFromTiles,
  getWordsFromBoard,
  unique
} = require('./utils/helpers')
const { path } = require('ramda')
const {board} = require('../game')

const splitDot = key => key.split('.').length 
  ? [...key.split('.')]
  : key

const get = key => obj => typeof splitDot(key) == 'object' 
  ? path(splitDot(key), obj) 
  : obj[key]

  const nonTruthy = obj => !(typeof obj == 'object' && Object.keys(obj).length == 0) && Boolean(obj)
  
const state = {}
  
const getCordsOfIntersections = (boardWord, wordToCreate) => boardWord.filter(({letter}) => wordToCreate.includes(letter))

/* Take out the words that contain letters included in the word we are trying to accomplish,
also give it direction */
const findIntersectionsForWord = wordsOnBoard => word => wordsOnBoard
    .filter(boardWord => boardWord
      .filter(boardWord => word.includes(boardWord.letter).length))
      .filter(boardWord => getCordsOfIntersections(boardWord, word).length)
      .map(boardWord => ({ 
        boardWord, 
        coordsOfStart: getCordsOfIntersections(boardWord, word), 
        direction: getDirectionForNewWord(boardWord), 
        wordToCreate: word 
      }))

const sortWithDirection = direction => (a, b) => 
  direction === 'y' 
  ? a.y - b.y
  : a.x - b.x


const createNewCoordinates = (wordToCreate, direction) => coordOfStart => {
  const indexOfIntersectionInWord = wordToCreate.indexOf(get('letter')(coordOfStart))
  const lettersForward = []
  const lettersBackWards = []
  const { x, y } = coordOfStart

  let temp = 0
  for (let i = indexOfIntersectionInWord; i < wordToCreate.length; i++) {
    lettersForward.push({
      x: direction !== 'y' ? x + temp : x,
      y: direction !== 'x' ? y + temp : y,
      letter: wordToCreate[i]
    })
    temp++
  }
  temp = 0
  
  for (let i = indexOfIntersectionInWord; i > -1; i--) {
    lettersBackWards.push({
      x: direction !== 'y' ? x + temp : x,
      y: direction !== 'x' ? y + temp : y,
      letter: wordToCreate[i]
    })
    temp--
  }
  const _sortWithDirection = sortWithDirection(direction)
  return unique([...lettersForward, ...lettersBackWards]).sort(_sortWithDirection)
}



const getAllIntersections = ({ board, x, y, direction }) => {
  const intersections = []
  const pushTruthy = ({ x, y }) => board[`${x}:${y}`] && intersections.push(board[`${x}:${y}`])

  if (direction === 'x') {
    pushTruthy({ x: x-1, y })
    pushTruthy({ x: x+1, y })
  }
  
  if (direction === 'y') {
    pushTruthy({ y: y-1, x })
    pushTruthy({ y: y+1, x })
  }
  console.log({intersections})
  return intersections
}

const validateIntersections = (intersections) => {

}

const investigateCoordinate = direction => ({ x, y, letter }) => {
  const board = get('board')(state)
  /* board doesn't contain coordinate or board contains coordinate and coordinate matches letter */
  const intersections = []
  if (!board[`${x}.${y}`] || board[`${x}.${y}`].letter === letter) {
    intersections.push(...getAllIntersections({ board, x, y, direction }))
    if (intersections) {
      validateIntersections(intersections)
    }
    return { x, y, letter, intersections }
  }
}

const removeInvalidMoves = direction => attemptCoordinates => {
  const mapper = investigateCoordinate(direction)
  const validCoordinates = attemptCoordinates.map(mapper).filter(nonTruthy)
  // console.log(validCoordinates)
  return validCoordinates
}

const validateWordPath = ({ coordsOfStart, direction, wordToCreate }) => {
  const mapper = createNewCoordinates(wordToCreate, direction)
  const newCoordinates = coordsOfStart.map(mapper)
  const _mapper = removeInvalidMoves(direction)
  const validCoordinates = newCoordinates.map(_mapper)
  return validCoordinates && validCoordinates.length 
    ? validCoordinates
    : null
}

const validateAllPaths = wordsToCreate => wordsToCreate.map(validateWordPath)

const createSolution = game => {
  const board = getBoardFromTiles(game.tiles)
  state['board'] = createHashBoard(board)
  
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

  const wordsToCreateWithIntersection = wordsWithValue.map(findIntersectionsForWord(wordsOnBoard))
  // const wordsToCreateWithIntersection = [wordsWithValue[0]].map(findIntersectionsForWord(wordsOnBoard))
  // const validCoordinates = validateAllPaths(wordsToCreateWithIntersection[0])
  const validCoordinates = wordsToCreateWithIntersection.map(validateAllPaths)
  console.log(JSON.stringify(validCoordinates, null, 2))

}



createSolution(game)

module.exports = {
  createSolution
}
