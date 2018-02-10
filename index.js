let express = require('express')
let app = express()
let port = require('./config').port
app.listen(port,()=>{
  console.log('running on port ' + port)
})