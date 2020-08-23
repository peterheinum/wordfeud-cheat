const game = require('../game')
const {
  createHashBoard,
  getDirectionForNewWord,
  getValueOfWords,
  getBoardFromTiles,
  getWordsFromBoard,
  unique
} = require('../src/utils/helpers')

const state = {}

const tree = leafs => {
  const branches = []
  if (leafs.length == 1) return leafs
  for (let k in leafs) {
    let leaf = leafs[k]
    tree(leafs.join('').replace(leaf, '')
      .split(''))
      .concat('')
      .map(subtree => branches.push([leaf].concat(subtree)))
  }
  return branches
}

const createSolution = game => {
  const board = getBoardFromTiles(game.tiles)
  state['board'] = createHashBoard(board)
  
  const lettersOnBoard = game.tiles.map(([_, __, letter]) => letter)
  const user = game.players.find(player => player.is_local)
  const { rack } = user
  const lettersAndRack = [...rack, ...lettersOnBoard]
  console.log(lettersAndRack)
  //// this takes two minutes what the fuck
  // const combinationsOfHand = getCombinationsForHand(lettersAndRack).map(arrToString)
}

createSolution(game)