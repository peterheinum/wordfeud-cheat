const { pointsOfLetters } = require('./structures')
const flatten = ([...stack]) => {
  const res = []
  while (stack.length) {
    const next = stack.pop()
    Array.isArray(next) 
      ? stack.push(...next)
      : res.push(next) 
  }

  return res.reverse()
}

const getWordsFromBoard = board => {
  const words = {}
  words['0'] = []
  let wordIndex = 0

  const push = (direction, z) => {
    for (let i = 0; i < 15; i++) {
      const tile = direction == 'x'
        ? board.find(e => e.x == i && e.y == z)
        : board.find(e => e.y == i && e.x == z)
      if (!tile || tile.isEmpty) {
        wordIndex++
        words[wordIndex] = []
        continue
      }
      typeof (words[wordIndex]) == 'object' && !tile.isEmpty && words[wordIndex].push(tile)
    }
  }

  for (let i = 0; i < 15; i++) {
    push('x', i)
  }

  for (let i = 0; i < 15; i++) {
    push('y', i)
  }

  return Object.keys(words).map(e => words[e]).filter(x => x.length > 1)
}

const tileDirection = (tiles) => {
  const startx = tiles[0].x
  const lastx = last(tiles).x
  if (startx !== lastx) return 'x'

  const starty = tiles[0].y
  const lasty = last(tiles).y
  if (starty !== lasty) return 'y'
}

const getValueOfWords = words => words.reduce((acc, word) => {
  const value = evaluateWord(word)
  acc.push({ word, value })
  return acc
}, []).sort((a, b) => b.value - a.value)

const unique = array => [...new Set(array)]

const arrToString = array => array.toString().split(',').join('')

const evaluateWord = word => [...word].reduce((acc, cur) => acc + pointsOfLetters[cur], 0)

const getBoardFromTiles = tiles => tiles.map(([x, y, letter, filler]) => ({ x, y, letter, filler }))

const uniqFlat = array => unique(flatten(array))

const last = array => array[array.length - 1]

module.exports = {
  last,
  unique, 
  flatten,
  uniqFlat,
  arrToString,
  evaluateWord,
  tileDirection,
  getValueOfWords,
  getBoardFromTiles,
  getWordsFromBoard,
}