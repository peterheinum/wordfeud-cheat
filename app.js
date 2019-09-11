require('dotenv').config();
const wordfeudApi = require('wordfeud-api');
const api = new wordfeudApi();
const parser = require('fast-xml-parser');
const fs = require('fs');
const email = process.env.EMAIL;
const pass = process.env.PASSWORD;
const tilemap = require('./tilemap.js')



const convertBoardArrayToObj = board => board.map(([x, y, l]) => ({ x, y, l }))
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
      // console.log(games)
      api.getGame(2616448922, result.sessionId, (err, res) => {
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



async function analyzeBoard(res) {
  const list = await readDSSO();
  let rack = res.players.find(x => x.username == 'coolguy1996').rack;
  const index = rack.indexOf('')
  if (~index) rack[index] = '*'

  const hand = rack
    .toString()
    .split(',')
    .join('');
  let temp;
  let handCombinations = [];
  for (let i = 0; i < hand.length; i++) {
    temp
      ? (temp = temp[temp.length - 1] + temp.slice(0, -1))
      : (temp = hand[hand.length - 1] + hand.slice(0, -1));
    handCombinations.push(temp);
  }

  console.log("your hand", hand)

  const cordinates = convertBoardArrayToObj(res.tiles)

  const xWords = clean(getWordsFrom('y', cordinates));
  const yWords = clean(getWordsFrom('x', cordinates));

  const allWords = removeEmptyArrays(xWords.concat(yWords));

  const wordsOnBoard = allWordsToStrings(allWords)




  const lookupObj = list.reduce((acc, cur) => {
    if (cur) {
      acc[cur.toUpperCase()] = cur.toUpperCase();
    }
    return acc;
  }, {})



  let combos = []
  for (let i = 0; i < wordsOnBoard.length; i++) {
    const e = wordsOnBoard[i]
    handCombinations.forEach(o => {
      const combs = combinations(o)
      combs.forEach(combo => {
        combos.push(e + combo)
        combos.push(combo + e)
      });
    })
  }



  const realCombos = unique(combos.map(x => x == lookupObj[x] ? x : null).filter(x => x))


  let tempWords = []
  allWords.forEach(e => {
    e.forEach(o => {
      if (o) tempWords.push(o.map(x => x.l))
    })
  })

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



  positiveWords.forEach(e => console.log(e))

  const partsOfWordsOnBoard = positiveWords.map(x => {
    whatPartIsOnBoard(x.word, allWords)

  })

  // positiveWords.forEach(o => {
  //   const letterOnBoard = whatLetterIsOnBoard(o.word, cordinates)
  //   if (letterOnBoard) {
  //     isWordPlayable(o.word, cordinates, letterOnBoard, wordsOnBoard, lookupObj, hand)
  //   }
  // })
}

function whatPartIsOnBoard(word, allWords) {
  getPlayExamples('x', word, allWords)
}


function getPlayExamples(xy, [...word], allWords, cordinates) {
  const yx = xy == 'y' ? 'x' : 'y'

  // const columns = unique(cordinates.map(o => o[xy])).sort((a, b) => a - b)
  const arrToString = (arr) => arr.toString().split(',').join('')
  const words = []
  allWords.forEach(e => {
    e.forEach(o => {
      words.push({
        [arrToString(o.map(x => x.l))]: o
      })
    })
  })


  const compare = (arr1, arr2) => {
    const objMap = {};
    arr1.forEach((e1) => arr2.forEach((e2) => {
      if (e1 === e2) {
        objMap[e1] = objMap[e1] + 1 || 1;
      }
    }))
    return objMap
  }


  const matches = []
  words.forEach(o => {
    Object.keys(o).forEach(l => {
      const spread = [...l]
      if(Object.keys(compare(word, spread)).length > 0) matches.push({ onBoard: o }, word)
    })
  })
  console.log(matches)


  return
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




function allWordsToStrings(allWords) {
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

const getMultipliers = (word) => {
  return word.reduce((acc, cur) => [...acc, tilemap[`${cur.x}:${cur.y}`]], [])
}

const isBoardAcceptable = (words, lookupObj) => {
  let success = [];
  for (let i = 0; i < words.length; i++) {
    const e = words[i];
    const item = lookupObj[e] == e;
    if (item) {
      success.push(lookupObj[e].toUpperCase())
    }
  }
  return success.length == words.length
}


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



