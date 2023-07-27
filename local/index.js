// /**
// * Created https://github.com/mcphee11/levenshtein as a example for local Node.js
// */

var express = require('express')
var myParser = require('body-parser')
const { distance, closest } = require('fastest-levenshtein')
var app = express()
const port = 3000

app.use(myParser.json())
app.post('/', function (req, res) {
  console.log(req.body)
  var arr = req.body.arrayobject.split(',')
  var close = closest(req.body.item, arr)
  var dis = distance(req.body.item, close)
  console.log(`Score: ${dis} Match: ${close}`)
  res.send({ score: dis, match: close })
  res.end()
})

app.listen(port)
console.log(`listening on localhost:${port}`)