const tileValues = [
  {x: 0, y: 0, multiplier: 'TB'},
  {x: 4, y: 0, multiplier: 'TO'},
  {x: 7, y: 0, multiplier: 'DB'},
  {x: 10, y: 0, multiplier: 'TO'},
  {x: 14, y: 0, multiplier: 'TB'},

  {x: 0, y: 14, multiplier: 'TB'},
  {x: 4, y: 14, multiplier: 'TO'},
  {x: 7, y: 14, multiplier: 'DB'},
  {x: 10, y: 14, multiplier: 'TO'},
  {x: 14, y: 14, multiplier: 'TB'},

  //___________________________

  {x: 2, y: 1, multiplier: 'DB'},
  {x: 5, y: 1, multiplier: 'TB'},
  {x: 9, y: 1, multiplier: 'TB'},
  {x: 13, y: 1, multiplier: 'DB'},
  
  {x: 2, y: 13, multiplier: 'DB'},
  {x: 5, y: 13, multiplier: 'TB'},
  {x: 9, y: 13, multiplier: 'TB'},
  {x: 13, y: 13, multiplier: 'DB'},

  //____________________________

  {x: 2, y: 2, multiplier: 'DO'},
  {x: 6, y: 2, multiplier: 'DB'},
  {x: 8, y: 2, multiplier: 'DB'},
  {x: 12, y: 2, multiplier: 'DO'},

  {x: 2, y: 12, multiplier: 'DO'},
  {x: 6, y: 12, multiplier: 'DB'},
  {x: 8, y: 12, multiplier: 'DB'},
  {x: 12, y: 12, multiplier: 'DO'},

  //____________________________

  {x: 3, y: 3, multiplier: 'TB'},
  {x: 7, y: 3, multiplier: 'DO'},
  {x: 11, y: 3, multiplier: 'TB'},

  {x: 3, y: 11, multiplier: 'TB'},
  {x: 7, y: 11, multiplier: 'DO'},
  {x: 11, y: 11, multiplier: 'TB'},

  //____________________________

  {x: 0, y: 4, multiplier: 'TO'},
  {x: 4, y: 4, multiplier: 'DO'},
  {x: 6, y: 4, multiplier: 'DB'},
  {x: 8, y: 4, multiplier: 'DB'},
  {x: 10, y: 4, multiplier: 'DO'},
  {x: 14, y: 4, multiplier: 'TO'},

  {x: 0, y: 10, multiplier: 'TO'},
  {x: 4, y: 10, multiplier: 'DO'},
  {x: 6, y: 10, multiplier: 'DB'},
  {x: 8, y: 10, multiplier: 'DB'},
  {x: 10, y: 10, multiplier: 'DO'},
  {x: 14, y: 10, multiplier: 'TO'},

  //____________________________

  {x: 1, y: 5, multiplier: 'TB'},
  {x: 5, y: 5, multiplier: 'TB'},
  {x: 9, y: 5, multiplier: 'TB'},
  {x: 13, y: 5, multiplier: 'TB'},

  {x: 1, y: 9, multiplier: 'TB'},
  {x: 5, y: 9, multiplier: 'TB'},
  {x: 9, y: 9, multiplier: 'TB'},
  {x: 13, y: 9, multiplier: 'TB'},

  //____________________________

  {x: 2, y: 6, multiplier: 'DB'},
  {x: 4, y: 6, multiplier: 'DB'},
  {x: 10, y: 6, multiplier: 'DB'},
  {x: 12, y: 6, multiplier: 'DB'},

  {x: 2, y: 8, multiplier: 'DB'},
  {x: 4, y: 8, multiplier: 'DB'},
  {x: 10, y: 8, multiplier: 'DB'},
  {x: 12, y: 8, multiplier: 'DB'},

  //____________________________

  {x: 0, y: 7, multiplier: 'DB'},
  {x: 3, y: 7, multiplier: 'DO'},
  {x: 11, y: 7, multiplier: 'DO'},
  {x: 14, y: 7, multiplier: 'DB'},
]

module.exports = tileValues.reduce((acc, cur) => ({...acc, [`${cur.x}:${cur.y}`]: cur.multiplier}),{})