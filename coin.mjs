const HEADS = 'heads'
const TAILS = 'tails'
const WIN = 'win'
const LOSE = 'lose'


/** Coin flip functions 
 * This module will emulate a coin flip given various conditions as parameters as defined below
 */

/** Simple coin flip
 * 
 * Write a function that accepts no parameters but returns either heads or tails at random.
 * 
 * @param {*}
 * @returns {string} 
 * 
 * example: coinFlip()
 * returns: heads | tails
 * 
 */

export function coinFlip() {
  // Randomize the flip with randomize or math
  return (Math.round(Math.random()) == 0) ? HEADS : TAILS
}

/** Multiple coin flips
 * 
 * Write a function that accepts one parameter (number of flips) and returns an array of 
 * resulting "heads" or "tails".
 * 
 * @param {number} flips 
 * @returns {string[]} results
 * 
 * example: coinFlips(10)
 * returns:
 *  [
      'heads', 'heads',
      'heads', 'tails',
      'heads', 'tails',
      'tails', 'heads',
      'tails', 'heads'
    ]
 */

export function coinFlips(flips) {
  var allFlips = [];

  for (let i = 0; i < flips; i++) {
    allFlips.push(coinFlip())
  }

  return allFlips
}

/** Count multiple flips
 * 
 * Write a function that accepts an array consisting of "heads" or "tails" 
 * (e.g. the results of your `coinFlips()` function) and counts each, returning 
 * an object containing the number of each.
 * 
 * example: conutFlips(['heads', 'heads','heads', 'tails','heads', 'tails','tails', 'heads','tails', 'heads'])
 * { tails: 5, heads: 5 }
 * 
 * @param {string[]} array 
 * @returns {{ heads: number, tails: number }}
 */

export function countFlips(array) {
  var summary = {
    heads: 0,
    tails: 0
  }
  // TODO: account for undefined input?
  array.forEach(flip => {
    if (flip === HEADS) {
      summary.heads++
    } else if (flip === TAILS) {
      summary.tails++
    }
  })

  // Remove uneccessary properties.
  if (summary.heads == 0) {
    delete summary.heads
  } else if (summary.tails == 0) {
    delete summary.tails
  }

  return summary
}

/** Flip a coin!
 * 
 * Write a function that accepts one input parameter: a string either "heads" or "tails", flips a coin, and then records "win" or "lose". 
 * 
 * @param {string} call 
 * @returns {object} with keys that are the input param (heads or tails), a flip (heads or tails), and the result (win or lose). See below example.
 * 
 * example: flipACoin('tails')
 * returns: { call: 'tails', flip: 'heads', result: 'lose' }
 */

export function flipACoin(call) {
  if (call === HEADS || call === TAILS) {
    var resultsSummary = {
      call: call,
      flip: coinFlip(),
      result: null
    }

    resultsSummary.result = ((resultsSummary.call === resultsSummary.flip) ? WIN : LOSE)
    return resultsSummary
  } else if (call === "" || call == null) {
    throw 'Error: no input.'
  } else {
    throw 'Usage: node guess-flip --call=[heads|tails]'
  }
}