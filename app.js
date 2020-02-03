require('dotenv').config();
const wordfeudApi = require('wordfeud-api');
const api = new wordfeudApi();
const fs = require('fs');
const email = process.env.EMAIL;
const pass = process.env.PASSWORD;
const tilemap = require('./tilemap.js')

const line = () => console.log('_________________\n')


const board = []
const eraseBoard = () => board.splice(0, board.length)

const filledBoard = []
const erasefilledBoard = () => filledBoard.splice(0, filledBoard.length)

const hand = []
const erasehand = () => hand.splice(0, hand.length)

Array.prototype.last = function () {
  return this[this.length - 1]
}

Array.prototype.clean = function () {
  return this.filter(x => x)
}

Array.prototype.log = function () {
  return this.forEach(e => console.log(e))
}

Array.prototype.flat = function () {
  return flatten(JSON.parse(JSON.stringify(this)))
}

Array.prototype.arrToString = function () {
  return this.toString().split(',').join('')
}

Array.prototype.unique = function () {
  return [...new Set(this)]
}

Array.prototype.getIndex = function (item, key) {
  const indexes = []
  for (let i = 0; i < this.length; i++) {
    const equals = key ? item[key] == this[i] : item == this[i]
    equals && indexes.push(i)
  }
  return indexes
}

console.log(tilemap)
const convertBoardArrayToObj = boardStructure => boardStructure.map(([x, y, l, custom]) => ({ x, y, l, custom }))

//Evaluate(word) unique flatten combinations functions
const ev = (word) => word && [...word].reduce((acc, cur) => acc + wp[cur], 0)
const evL = (letter) => wp[letter]

const removeEmptyArrays = (arr) => arr.filter(x => x.length)


const readDSSO = () => {
  return new Promise(resolve => {
    fs.readFile('./dsso.txt', { encoding: 'utf16le' }, (err, res) => {
      const filters = [':!', '::', ': ',]

      const splitters = [
        'substantiv',
        'adjektiv',
        'egennamn',
        'verb',
        'pronomen'
      ]

      const extractWord = (array, filter) => array.map(x => x.split(filter)[0].split(':'))

      const allWords = splitters.map(x => (filters.map(filter => extractWord(res.split(`<${x}>`), filter)).flat()))
      const [a, b, c, d, e] = allWords
      const arr = [...a, ...b, ...c, ...d, ...e]

      const everything = arr.reduce((acc, cur) => {
        if (typeof (cur) == 'string' && cur.length > 1) acc.push(cur.toUpperCase())
        return acc
      }, [])
      const uniq = everything.unique()

      resolve(uniq)
    })
  })
}

const printBoard = () => {
  for (let i = 0; i < 14; i++) {
    let tiles = ''
    for (let j = 0; j < 14; j++) {
      const tile = filledBoard.find(e => e.y == i && e.x == j)
      if (!tile.isEmpty) {
        tiles = tiles + '  ' + tile.l
      }
      else {
        tiles = tiles + ' _ '
      }
    }
    console.log(tiles)
  }
}

analyzeBoard()
// loginAndGetGame()
function loginAndGetGame() {
  api.login(email, pass, (err, result) => {
    if (err) return console.log(err);
    api.getGames(result.sessionId, (err, games) => {
      if (err) return console.log(err);
      api.getGame(2728945603, result.sessionId, (err, res) => {
        if (res) {
          analyzeBoard(res)
        }
      });
    });
  });
}

const fillBoard = () => {
  const flatBoard = board.flat()
  const array = []
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      const existing = flatBoard.find(e => e.x == i && e.y == j)
      existing ? array.push(existing) : array.push({ x: i, y: j, isEmpty: true })
    }
  }
  array.forEach(e => filledBoard.push(e))
}

const arrayToString = array => array.reduce((acc, cur) => acc += cur, '')

const allWordsToStrings = allWords => allWords
    .map(o => o.flat().map(o => o.l))
    .reduce((acc, cur) => [...acc, arrayToString(cur)], [])


async function analyzeBoard() {
  let rack = ['D', 'I', 'R', 'B', 'Ä', 'U', 'E']
  const res = {
    tiles:
      [[12, 5, 'A', false],
      [10, 6, 'P', false],
      [12, 6, 'X', false],
      [7, 7, 'K', false],
      [8, 7, 'O', false],
      [9, 7, 'K', false],
      [10, 7, 'A', false],
      [11, 7, 'D', false],
      [12, 7, 'E', false],
      [10, 8, 'R', false],
      [12, 8, 'L', false],
      [10, 9, 'E', false],
      [10, 10, 'N', false]]
  }


  // let rack = res.players.find(x => x.username == 'coolguy1996').rack.filter(x => x);

  const list = await readDSSO()

  ~rack.indexOf('') && (rack[rack.indexOf('')] = '*'.toString().split(',').join(''))

  let temp;
  const handCombinations = [];
  for (let i = 0; i < rack.length; i++) {
    temp
      ? (temp = temp[temp.length - 1] + temp.slice(0, -1))
      : (temp = rack[rack.length - 1] + rack.slice(0, -1))
    handCombinations.push(temp)
  }
  //Push items to hand so we can access hand() globally
  rack.forEach(e => hand.push(e))


  const cordinates = convertBoardArrayToObj(res.tiles)

  const allWords = readBoard(cordinates)

  allWords.forEach(e => board.push(e))


  const wordsOnBoard = allWordsToStrings(allWords)

  const lookupObj = list.reduce((acc, cur) => {
    if (cur) {
      acc[cur.toUpperCase()] = cur.toUpperCase();
    }
    return acc;
  }, {})


  let combos = []
  //Removed this so we can test only playing things from hand until we move into harder stuff
  // for (let i = 0; i < wordsOnBoard.length; i++) {
  //   const e = wordsOnBoard[i]
  //   handCombinations.forEach(o => {
  //     const combs = combinations(o)
  //     combs.forEach(combo => {
  //       combos.push(e + combo)
  //       combos.push(combo + e)
  //     });
  //   })
  // }

  const realCombos = combos.map(x => x == lookupObj[x] ? x : null).unique().clean()
  const tempWords = []
  board.forEach(e => e && tempWords.push(e.map(x => x.l)))

  let bigArray = []
  tempWords.forEach(e => {
    const o = handCombinations;
    for (let i = 0; i < e.length; i++) {
      o.forEach(x => bigArray.push(x + e[i]))
    }
  });

  let success = [];

  if (!tempWords.length) {
    const emptyBoardPlays = handCombinations.map(x => combinations(x)).flat()
    for (let i = 0; i < emptyBoardPlays.length; i++) {
      const e = emptyBoardPlays[i]
      if (lookupObj[e] == e) success.push(e.toUpperCase())
    }
  }

  success = success.flat()


  const set = bigArray.unique()
  const arr = set.map(e => combinations(e)).flat()


  for (let i = 0; i < arr.length; i++) {
    const e = arr[i]
    const item = lookupObj[e] == e
    if (item) {
      success.push(lookupObj[e].toUpperCase())
    }
  }

  realCombos.forEach(e => success.push(e))

  fillBoard()
  printBoard()

  const positiveWords = success.unique().map(e => ({ word: e, points: ev(e) })).sort((a, b) => b.points - a.points)

  const partsOfWordsOnBoard = positiveWords.map(e => whatPartIsOnBoard(e.word)).clean()

  const wordsWithDirections = partsOfWordsOnBoard.map(e => filterNonLiningSuggestions(e).clean())


  wordsWithDirections.forEach(e => {
    const alternativesX = canPlayX(e)

    const alternativesY = canPlayY(e)

    if (alternativesX.find(e => e.move)) {
      calculateRealValue(alternativesX.find(e => e.move), 'alternativesX')
    }

    if (alternativesY.find(e => e.move)) {
      calculateRealValue(alternativesY.find(e => e.move), 'alternativesY')
    }


  })
}


const calculateRealValue = (item, dirr) => {
  const { move } = item
  let goodideas = []
  const translators = {
    'TB': (letter) => letter * 3,
    'DB': (letter) => letter * 2,
    'TO': (word) => (ev(word) * 3),
    'DO': (word) => (ev(word) * 2),
  }
  console.log(move, dirr)
  const multipliers = getMultipliers(move)
  console.log(multipliers)

  return
  const Do_To = multipliers.find(x => x == 'DO' || x == 'TO')
  if (Do_To) {
    const points = translators[Do_To](move)
    goodideas.push({ word: move, points })
  }
  else {
    let points = 0
    move.forEach((l, i) => {
      const multi = multipliers[i]
      if (multi) points = points + translators[multi](evL(l.l))
      else points = points + evL(l.l)
    })
    goodideas.push({ word: y, points })
  }
}


const readLine = (direction, z, newLetter) => {
  //send in what Y or X in Z and a direction that is opposite of X or Y that you sent in in Z
  const words = {}
  words['0'] = []
  let wordIndex = 0
  const _board = filledBoard
  _board.splice(_board.findIndex(e => e.y == newLetter.y && e.x == newLetter.x), 1, newLetter)
  for (let i = 0; i < 15; i++) {
    const tile = direction == 'x'
      ? _board.find(e => e.x == i && e.y == z)
      : _board.find(e => e.y == i && e.x == z)
    if (!tile || tile.isEmpty) {
      wordIndex++
      words[wordIndex] = []
      continue
    }
    typeof (words[wordIndex]) == 'object' && !tile.isEmpty && words[wordIndex].push(tile)
  }

  const newWord = Object.keys(words)
    .map(e => words[e])
    .find(e => e.some(o => o.x == newLetter.x && o.y == newLetter.y))
  return newWord
}

function readBoard(daBoard) {
  const words = {}
  words['0'] = []
  let wordIndex = 0
  const _board = daBoard

  const push = (direction, z) => {
    for (let i = 0; i < 15; i++) {
      const tile = direction == 'x'
        ? _board.find(e => e.x == i && e.y == z)
        : _board.find(e => e.y == i && e.x == z)
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


const canPlayY = suggestions => {
  console.log(suggestions.length)
  const possible = suggestions.map(suggestion => {
    const { tiles, word, inCommon, direction, linesUp } = suggestion
    
    if (direction == 'x') {
      const playAndNewWord = inCommon.map(letter => {
        const index = word.indexOf(letter)
        const startY = tiles[0].y - index
        const x = tiles[0].x
        let i = 0
        
        
        const newWords = []
        const move = []
        const badMove = () => move.splice(0, move.length) && newWords.splice(0, newWords.length) && (i = 0)

        for (let y = startY; y < startY + word.length; y++) {
          const l = word[i]
          i++

          if (y == 15) {
            console.log('badmove')
            badMove()
            break
          }

          const newWord = y !== startY && collidesRight(x, y) || collidesLeft(x, y) ? readLine('x', y, { x, y, l }) : false
          const crashY = y !== startY && !inCommon.includes(l) && collidesUp(x, y) || collidesDown(x, y) ? readLine('y', y, { x, y, l }) : false
          if (crashY) {
            badMove()
            break
          }

          newWord && newWords.push(newWord)
          move.push({ y, x, l })
        }
        return { move, newWords }
      }).filter(e => e.move.length)
      return playAndNewWord
    }
  })
  return possible.clean().flat()
}

const canPlayX = suggestions => {
  const possible = suggestions.map(suggestion => {
    const { tiles, word, inCommon, direction, linesUp } = suggestion
    if (direction == 'y') {
      const playAndNewWord = inCommon.map(letter => {
        const index = word.indexOf(letter)
        const StartX = tiles[0].x - index
        const y = tiles[0].y
        let i = 0

        const newWords = []
        const move = []
        const badMove = () => move.splice(0, move.length) && newWords.splice(0, newWords.length) && (i = 0)

        for (let x = StartX; x < StartX + word.length; x++) {
          const l = word[i]
          i++

          if (x == 15) {
            console.log('x got to 15 :[[')
            badMove()
            break
          }

          const newWord = x !== StartX && collidesUp(x, y) || collidesDown(x, y) ? readLine('y', y, { x, y, l }) : false
          const crashX = x !== StartX && !inCommon.includes(l) && collidesRight(x, y) || collidesLeft(x, y) ? readLine('x', y, { x, y, l }) : false
          if (crashX) {            // console.log('left?:',collidesLeft(x, y), x, y)
            badMove()
            break
          }

          newWord && newWords.push(newWord)
          move.push({ y, x, l })
        }

        // console.log(move)
        // console.log(newWords)
        return { move, newWords }
      }).filter(e => e.move.length)
      return playAndNewWord
    }
  })
  return possible.clean().flat()
}

const filterNonLiningSuggestions = (suggestions) => {
  return suggestions.map(item => {
    const { onBoard, inCommon, word } = item
    const { tiles } = onBoard

    const direction = tileDirection(tiles)
    const linesUp = checkIfMatchesLineUp(tiles, inCommon)
    
    return { tiles, word, inCommon, direction, linesUp }
  })
}




const checkIfMatchesLineUp = (tiles, inCommon) => {
  let j = tiles.indexOf(tiles.filter(e => e.l == inCommon[0]).last())
  let linesUp = true
  for (let i = 0; i < inCommon.length; i++) {
    if (linesUp == false) break
    linesUp = tiles[j] && tiles[j].l == inCommon[i]
    j++
  }

  tiles.last().l !== inCommon.last() && (linesUp = false)
  return linesUp
}


const tileDirection = (tiles) => {
  const startx = tiles[0].x
  const lastx = tiles.last().x
  if (startx !== lastx) return 'x'

  const starty = tiles[0].y
  const lasty = tiles.last().y
  if (starty !== lasty) return 'y'
}



const collidesUp = (x, y) => {
  const tile = filledBoard.find(e => e.y == y - 1 && e.x == x)
  return tile ? !tile.isEmpty : true
}

const collidesDown = (x, y) => {
  const tile = filledBoard.find(e => e.y == y + 1 && e.x == x)
  return tile ? !tile.isEmpty : true
}

const collidesRight = (x, y) => {
  const tile = filledBoard.find(e => e.x == x + 1 && e.y == y)
  return tile ? !tile.isEmpty : true
}

const collidesLeft = (x, y) => {
  const tile = filledBoard.find(e => e.x == x - 1 && e.y == y)
  return tile ? !tile.isEmpty : true
}

const whatPartIsOnBoard = ([...word]) => {
  const words = board.filter(x => !x.isEmpty).map(e => ({ word: e.map(x => x.l).arrToString(), tiles: e }))
  
  const compare = (a, b) => a.filter(e => b.includes(e))
  const matches = []
  words.forEach(o => {
    const spread = [...o.word]
    const inCommon = compare(spread, word)
    inCommon.length > 0 && matches.push({ onBoard: o, word, inCommon })
  })
  

  //this means we return only the matches that contain atleast one letter from board
  return matches.filter(e => [...e.word].find(o => hand.indexOf(o)))
}

const getMultipliers = word => word.reduce((acc, cur) => [...acc, tilemap[`${cur.x}:${cur.y}`]], [])

function flatten([...stack]) {
  const res = []
  while (stack.length) {
    const next = stack.pop()
    Array.isArray(next) 
      ? stack.push(...next)
      : res.push(next) 
  }

  return res.reverse()
}

function combinations(chars) {
  //infinite loop if * 
  const index = chars.indexOf('*')
  if (~index) {
    let temp = [...chars]
    temp[index] = ''
    chars = temp.toString().split(',').join('')
    alphabet.forEach(e => chars = chars + e)
  }
  const result = [];
  let f = (prefix, chars) => {
    for (let i = 0; i < chars.length; i++) {
      result.push(prefix + chars[i]);
      f(prefix + chars[i], chars.slice(i + 1));
    }
  };
  f('', chars);
  return result;
}


const wp = {
  A: 1,
  B: 3,
  C: 8,
  D: 1,
  E: 1,
  F: 3,
  G: 2,
  H: 3,
  I: 1,
  J: 7,
  K: 3,
  L: 2,
  M: 3,
  N: 1,
  O: 2,
  P: 4,
  R: 1,
  S: 1,
  T: 1,
  U: 4,
  V: 3,
  X: 8,
  Y: 7,
  Z: 8,
  Å: 4,
  Ä: 4,
  Ö: 4
};

const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'Å',
  'Ä',
  'Ö'
];



