const { distance, closest } = require('fastest-levenshtein')

exports.handler = async (event) => {
  // Retrieve Data Action inputs From Event
  let item = event.item
  let items = event.items

  try {
    if (items == '' || items == null || items == undefined) {
      throw new Error('Missing Input items of type string with comma separated values')
    }
    if (item == '' || item == null || item == undefined) {
      throw new Error('Missing Input item of type string')
    }

    const arr = items.split(',')
    console.log(`## Number of items in itemsArray: ${arr.length}`)
    const closestItem = closest(item, arr)
    const distanceScore = distance(item, closestItem)
    console.log(`## Closest item: ${closestItem} Distance score: ${distanceScore}`)
    return {
      score: distanceScore,
      closestItem: closestItem,
    }
  } catch (error) {
    console.error('Handler failed: ' + error)
    throw new Error(error?.message ?? 'Error')
  }
}

