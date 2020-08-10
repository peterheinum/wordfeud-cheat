const wordlist = require('../wordlist')
const { getCombinationsForHand } = require('./utils/getCombinationsForHand')

const turnWordlistToHashMap = wordlist => {
  const hash = {}
  for (let i = 0; i < wordlist.length; i++) {
    const word = wordlist[i]
    hash[word] = word
  }
  return hash
}

// const wordHashMap = turnWordlistToHashMap(wordlist.split(','))

const createSolution = () => {
  
}

module.exports = {
  createSolution
}
