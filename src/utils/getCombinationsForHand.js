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

module.exports = { getCombinationsForHand: tree }