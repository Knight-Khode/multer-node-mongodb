const express = require('express')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')

const app = express()



//set view engine
app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.render('index')
})

const port = 5000
app.listen(port,()=>console.log(`Server started on port ${port}...`))