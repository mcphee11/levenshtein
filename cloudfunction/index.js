/**
 * Created https://github.com/mcphee11/levenshtein as an example GCP Cloud Function
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
const { distance, closest } = require('fastest-levenshtein')
exports.start = async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
  } else {
    // Do actual function
    var arr = req.body.arrayobject.split(',')
    console.log(`Array: ${arr}`)
    var close = closest(req.body.item, arr)
    var dis = distance(req.body.item, close)
    console.log(`Closest: ${close} Distance: ${dis}`)
    res.send({ score: dis, match: close })
  }
}
