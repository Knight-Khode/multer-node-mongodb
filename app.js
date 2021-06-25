const express = require('express')

const app = express()

//set view engine
app.set('view engine','ejs')

const port = 5000
app.listen(port,()=>console.log(`Server started on port ${port}...`))