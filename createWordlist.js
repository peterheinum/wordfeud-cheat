require('dotenv').config()
const fs = require('fs')
const { readDSSO } = require('./app')

const printToWordlist = arr => fs.writeFileSync('./wordlist.js', `module.exports = \`${arr.join(',')}\``)

const splitAt = splitter => str => str.includes(splitter) ? str.split(splitter)[1] : str

const splitSpace = splitAt(' ')
const splitComma = str => str.includes(',') ? str.split(',') : str
const splitSubstantiv = splitAt('<SUBSTANTIV>')
const splitCustom = splitAt('CUSTOM')

const removeSpace = arr => arr.map(splitSpace)
const removeComma = arr => arr.map(splitComma)
const removeSubstantiv = arr => arr.map(splitSubstantiv)
const removeCustom = arr => arr.map(splitCustom)

const filterNumber = str => { 
  if (str.includes(')')) {
    return typeof parseInt(str.split(')')[0]) !== 'number'
  }
  if (str.includes('R')) {
    return typeof parseInt(str.split('r')[0]) !== 'number'
  }

  return true 
}

const removeNumbers = arr => arr.filter(filterNumber)

const filterCompound = str => !str.includes('COMPOUND')

const removeCompound = arr => arr.filter(filterCompound)

const refinePrint = arr => arr.unique().filter(Boolean).filter(str => str.length > 1)

const flatten = arr => arr.flat()

const main = async () => {
  await readDSSO()
  .then(removeComma)
  .then(flatten)
  .then(removeSpace)
  .then(flatten)
  .then(removeCustom)
  .then(flatten)
  .then(removeSubstantiv)
  .then(flatten)
  .then(removeNumbers)
  .then(flatten)
  .then(removeCompound)
  .then(flatten)
  .then(refinePrint)
  .then(flatten)
  .then(printToWordlist)
}

main()
  .catch(console.error)