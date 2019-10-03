require('dotenv').config();
const wordfeudApi = require('wordfeud-api');
const api = new wordfeudApi();
const parser = require('fast-xml-parser');
const fs = require('fs');
const email = process.env.EMAIL;
const pass = process.env.PASSWORD;
const tilemap = require('./tilemap.js')



const board = []
const eraseBoard = () => board.splice(0, board.length)

const hand = []
const erasehand = () => hand.splice(0, hand.length)


Array.prototype.last = function() {
  return this[this.length-1]
}

Array.prototype.clean = function() {
  return this.filter(x => x)
}

Array.prototype.log = function() {
  return this.forEach(e => console.log(e))
}

Array.prototype.flat = function() {
  return flatten(JSON.parse(JSON.stringify(this)))
}

Array.prototype.arrToString = function() {
  return this.toString().split(',').join('')
}

const convertBoardArrayToObj = boardStructure => boardStructure.map(([x, y, l]) => ({ x, y, l }))
const unique = (arr) => [...new Set(arr)]

//Evaluate(word) unique flatten combinations functions
const ev = (word) => word && [...word].reduce((acc, cur) => acc + wp[cur], 0)
const evL = (letter) => wp[letter]
const removeEmptyArrays = (arr) => arr.filter(x => x.length)


const readDSSO = () => {
  return new Promise((resolve, reject) => {
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

      const allWords = splitters.map(x => (flatten(filters.map(filter => extractWord(res.split(`<${x}>`), filter)))))
      const [a, b, c, d, e] = allWords
      const arr = [...a, ...b, ...c, ...d, ...e]

      const allt = arr.reduce((acc, cur) => {
        if (typeof (cur) == 'string' && cur.length > 1) acc.push(cur.toUpperCase())
        return acc
      }, [])
      const uniq = unique(allt)

      resolve(uniq)
    })
  })
}


loginAndGetGame()

function loginAndGetGame() {
  api.login(email, pass, (err, result) => {
    if (err) return console.log(err);
    api.getGames(result.sessionId, (err, games) => {
      if (err) return console.log(err);
      const game = games.find(e =>
        e.players.some(x => x.username == 'Life on mars 27')
      );
      api.getGame(2633992355, result.sessionId, (err, res) => {
        if (res) {
          analyzeBoard(res)
        } else {
          api.getGame((game ? game.id : 2562986584), result.sessionId, (err, ress) => {
            console.log('fuck')
          })
        }
      });
    });
  });
}

const fillBoard = () => {
  const flatBoard = board.flat()
  const filledBoard = []
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      const existing = flatBoard.find(e => e.x == i && e.y == j)
      existing ? filledBoard.push(existing) : filledBoard.push({x: i, y: j, isEmpty: true})
    }    
  }
}

async function analyzeBoard(res) {
  const list = await readDSSO();
  let rack = res.players.find(x => x.username == 'coolguy1996').rack;
  const index = rack.indexOf('')
  if (~index) rack[index] = '*'.toString().split(',').join('');
  let temp;
  let handCombinations = [];
  for (let i = 0; i < rack.length; i++) {
    temp
      ? (temp = temp[temp.length - 1] + temp.slice(0, -1))
      : (temp = rack[rack.length - 1] + rack.slice(0, -1));
    handCombinations.push(temp);
  }
  //Push items to hand so we can access hand() globally
  rack.forEach(e => hand.push(e))


  const cordinates = convertBoardArrayToObj(res.tiles)

  const xWords = getWordsFrom('y', cordinates).clean();
  const yWords = getWordsFrom('x', cordinates).clean();
  
  let allWords = removeEmptyArrays(xWords.concat(yWords));
  allWords = allWords.map(e => flatten(e))
  allWords.forEach(e => board.push(e))
  fillBoard()
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

  const realCombos = unique(combos.map(x => x == lookupObj[x] ? x : null).clean())

  const tempWords = []
  board.forEach(e => e && tempWords.push(e.map(x => x.l)))

  let bigArray = []
  tempWords.forEach(e => {
    const o = handCombinations;
    for (let i = 0; i < e.length; i++) {
      const letter = e[i]
      o.forEach(x => {
        bigArray.push(x + letter)
      })
    }
  });

  let success = [];

  if (!tempWords.length) {
    const emptyBoardPlays = flatten(handCombinations.map(x => combinations(x)))
    for (let i = 0; i < emptyBoardPlays.length; i++) {
      const e = emptyBoardPlays[i]
      if (lookupObj[e] == e) success.push(e.toUpperCase())
    }
  }

  success = flatten(success)


  const set = unique(bigArray)
  const arr = flatten(set.map(e => combinations(e)));


  for (let i = 0; i < arr.length; i++) {
    const e = arr[i];
    const item = lookupObj[e] == e;
    if (item) {
      success.push(lookupObj[e].toUpperCase())
    }
  }
  realCombos.forEach(e => success.push(e))

  const positiveWords = unique(success).map(e => ({ word: e, points: ev(e) })).sort((a, b) => b.points - a.points);
  // positiveWords.log()
  const partsOfWordsOnBoard = positiveWords.map(x => x.word == 'EKA' && whatPartIsOnBoard(x.word)).clean()
  // partsOfWordsOnBoard.forEach(e => console.log('\n', e))
  const wordsWithDirections = partsOfWordsOnBoard.map(e => filterNonLiningSuggestions(e)).clean()
  
  wordsWithDirections.forEach(e => {
    // const x = canPlayX(e)
    const y = canPlayY(e)
  })
}

const canPlayY = ({tiles, word, inCommon, direction}) => {
  console.log(tiles)
  console.log(word)
  console.log(inCommon)
  console.log(direction)
  console.log('______________')
}

const filterNonLiningSuggestions = (suggestions) => {
  return suggestions.map(item => {
    const { onBoard, inCommon, word } = item
    const { tiles } = onBoard
    const direction = tileDirection(tiles)

    const linesUp = checkIfMatchesLineUp(tiles, inCommon)

    if(inCommon.length > 1) {
      return linesUp ? { tiles, word, inCommon, direction, linesUp } : false
    }

    return { tiles, word, inCommon, direction, linesUp }
  })
} 




const checkIfMatchesLineUp = (tiles, inCommon) => {
  let j = tiles.indexOf(tiles.filter(e => e.l == inCommon[0]).last())
  let linesUp = true
 
  
  for (let i = 0; i < inCommon.length; i++) {
    linesUp = tiles[j].l == inCommon[i]
    j++
  }
  tiles.last().l !== inCommon.last() && (linesUp = false)
  return linesUp
}


const tileDirection = (tiles) => {
  const startx = tiles[0].x
  const lastx = tiles.last().x
  if(startx !== lastx) return 'x'  

  const starty = tiles[0].y
  const lasty = tiles.last().y
  if(starty !== lasty) return 'y'
}

const collidesUp = (x, y, board) => {
  const xtiles = board.filter(e => e.x == x)
  return !(y+1 == 15) && xtiles.find(e => e.y == y + 1 && e.x == x)
}

const collidesDown = (x, y, board) => {
  const xtiles = board.filter(e => e.x == x)
  return !(y-1 == -1) && xtiles.find(e => e.y == y - 1 && e.x == x)
}

const collidesRight = (x, y, board) => {
  const ytiles = board.filter(e => e.y == y)
  return !(x+1 == 15) && ytiles.find(e => e.x == x + 1 && e.y == y)
}

const collidesLeft = (x, y, board) => {
  const ytiles = board.filter(e => e.y == y)
  return !(x-1 == -1) && ytiles.find(e => e.x == x - 1 && e.y == y)
}





const whatPartIsOnBoard = ([...word]) => {
  const words = board.filter(x => !x.isEmpty).map(e => ({ word: e.map(x => x.l).arrToString(), tiles: e }) )

  const compare = (a, b) => a.filter(e => b.includes(e))

  const matches = []
  words.forEach(o => {
    const spread = [...o.word]
    const inCommon = compare(word, spread)
    inCommon.length > 0 && matches.push({ onBoard: o, word, inCommon })
  })

  //this means we return only the matches that contain atleast one letter from board
  return matches.filter(e => [...e.word].find(o => hand.indexOf(o)))
}




const allWordsToStrings = (allWords) => {
  const wordArray = allWords.map(o => flatten(o).map(o => o.l))
  return wordArray.reduce((acc, cur) => {
    const string = cur.toString().split(',').join('')
    acc.push(string)
    return acc
  }, [])
}

function isWordPlayable([...word], board, lettersOnBoard, wordsOnBoard, lookupObj, hand) {
  lettersOnBoard.forEach(letter => {
    const x = checkX(letter, word, board)
    const y = checkY(letter, word, board)
    if (x, y) {
      const tempboard = board.concat(y)
      const xWords = clean(getWordsFrom('y', tempboard));
      const yWords = clean(getWordsFrom('x', tempboard));
      const allWords = removeEmptyArrays(xWords.concat(yWords));
      const yourWords = allWordsToStrings(allWords)
      const newWords = yourWords.reduce((acc, cur) => {
        const exists = !!wordsOnBoard.find(x => x == cur)
        if (!exists) acc.push(cur)
        return acc
      }, [])
      const allowedPlays = newWords.reduce((acc, cur) => {
        !!lookupObj[cur] && acc.push(cur)
        return acc
      }, [])
      
      if (allowedPlays.length && allowedPlays.length == newWords.length) {
        let goodideas = []
        const translators = {
          'TB': (letter) => letter * 3,
          'DB': (letter) => letter * 2,
          'TO': (word) => (ev(word) * 3),
          'DO': (word) => (ev(word) * 2),
        }

        if (y) {
          const multipliers = getMultipliers(y)
          const Do_To = multipliers.find(x => x == 'DO' || x == 'TO')
          if (Do_To) {
            const points = translators[Do_To](y)
            goodideas.push({ word: y, points: points })
          }
          else {
            let points = 0
            y.forEach((l, i) => {
              const multi = multipliers[i]
              if (multi) points = points + translators[multi](evL(l.l))
              else points = points + evL(l.l)
            })
            goodideas.push({ word: y, points: points })
          }
        }

        if (x) {
          const multipliers = getMultipliers(x)
          const Do_To = multipliers.find(x => x == 'DO' || x == 'TO')
          if (Do_To) {
            const points = translators[Do_To](x)
            goodideas.push({ word: x, points: points })
          }
          else {
            let points = 0
            x.forEach((l, i) => {
              const multi = multipliers[i]
              if (multi) points = points + translators[multi](evL(l.l))
              else points = points + evL(l.l)
            })

            goodideas.push({ word: x, points: points })
          }
        }
        const sorted = goodideas.sort((a, b) => (a.points - b.points))
        sorted.forEach(e => {
          console.log(e.points, e.word.map(x => x.l).toString().split(',').join(''))
          console.log(allowedPlays)
          console.log('____________')
          console.log('\n')
        })

      }

    }

  })
}

const getMultipliers = (word) => word.reduce((acc, cur) => [...acc, tilemap[`${cur.x}:${cur.y}`]], [])



const checkX = (letter, word, board) => {
  const letterIndex = word.findIndex(o => o == letter.l)
  const stepsBack = letterIndex;
  let x = letter.x - letterIndex;
  const y = letter.y;
  const tileIntFrontOfX = board.filter(o => o.y == x).find(o => o.x == letter.x + 1)
  if (tileIntFrontOfX) return false;
  let clearTiles = []
  let alreadyExisting = []
  for (let i = 0; i < stepsBack; i++) {
    clearTiles.push({ x: x, y: y, l: word[i] })
    const match = board.find(o => o.x == x && o.x == y)
    if (match) alreadyExisting.push(match)
    x++;
  }


  return alreadyExisting.length ? false : clearTiles;
}

const checkY = (letter, word, board) => {
  const letterIndex = word.findIndex(o => o == letter.l)
  const stepsBack = letterIndex;
  let y = letter.y - letterIndex;
  const x = letter.x;
  const tileIntFrontOfX = board.filter(o => o.x == x).find(o => o.y == letter.y + 1)
  if (tileIntFrontOfX) return false;
  let clearTiles = []
  let alreadyExisting = []
  for (let i = 0; i < stepsBack; i++) {
    clearTiles.push({ x: x, y: y, l: word[i] })
    const match = board.find(o => o.x == x && o.y == y)
    if (match) alreadyExisting.push(match)
    y++;
  }

  return alreadyExisting.length ? false : clearTiles;
}




function whatLetterIsOnBoard([...word], cordinates) {
  let letter = null
  word.forEach(e => {
    const match = cordinates.reduce((acc, val) => {
      if (val.l == e) acc.push(val)
      return acc;
    }, [])
    if (match.length) {
      letter = match
    }
  })
  return letter ? letter : null;
}






function clean(arr, key) {
  return arr.reduce((acc, val) => {
    if (val) {
      key ? acc.push(val[key]) : acc.push(val)
    }
    return acc
  }, [])
}


function getWordsFrom(xy, cordinates) {
  const yx = xy == 'y' ? 'x' : 'y'
  cordinates = cordinates.sort((a, b) => a[yx] - b[yx])
  const columns = unique(cordinates.map(o => o[xy])).sort((a, b) => a - b)

  const wordsArray = []
  columns.forEach(e => {
    const lettersInColumn = cordinates.filter(o => o[xy] == e)
    let index = lettersInColumn[0][yx]

    //This loop will check for holes in the row and gather them
    const startsInRow = lettersInColumn.reduce((acc, o) => {
      if (o[yx] == index + 1) {
        index = o[yx];
        return acc;
      } else {
        index = o[yx];
        acc.push(index)
        return acc
      }
    }, [])


    let arr = []

    let lastY;
    lettersInColumn.forEach(o => {
      const isInLine = validateCordinate(startsInRow, o[yx], lastY)
      if (isInLine == true) {
        arr.push(o)
        lastY = o[yx];
      }
      if (isInLine == false) {
        console.log("nopenope big yikes")
      }
    });


    startsInRow.forEach(e => {
      const index = arr.indexOf(arr.find(x => x[yx] == e))
      arr.splice(index, 0, 'space')
    });

    let arrayOfWords = []
    let count = 0
    arr.forEach(e => {
      if (e == 'space') {
        count++
        arrayOfWords[count] = []
      }
      else if (e) arrayOfWords[count].push(e)
    })


    const finalArray = arrayOfWords.reduce((acc, val) => {
      if (val.length > 1) {
        acc.push(val)
      }
      return acc;
    }, [])
    wordsArray.push(finalArray)
  });

  return wordsArray;
}


function validateCordinate(startsArr, index, last) {
  let bool = false;
  startsArr.forEach(e => {
    if (e == index) bool = true;
    if (last + 1 == index) bool = true;
  });

  return bool;
}






function flatten(input) {
  const stack = [...input];
  const res = [];
  while (stack.length) {
    // pop value from stack
    const next = stack.pop();
    if (Array.isArray(next)) {
      // push back array items, won't modify the original input
      stack.push(...next);
    } else {
      res.push(next);
    }
  }
  //reverse to restore input order
  return res.reverse();
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



