const express = require('express')
const path = require('path')
const crypto = require('crypto')
const mongoose = require('mongoose')
const multer = require('multer')
const {GridFsStorage} = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const { resolve } = require('path')

const app = express()

//middlewares
app.use(express.json())
app.use(methodOverride('_method'))

//mongo connection
const mongoURI = "mongodb://localhost:27017/file-Upload"
const conn = mongoose.createConnection(mongoURI,{
    useCreateIndex:true,
    useFindAndModify:false,
    useNewUrlParser:true,
    useUnifiedTopology:true
})

//Initialize gfs
let gfs;

conn.once('open',()=>{
    gfs=Grid(conn.db,mongoose.mongo)
    gfs.collection('uploads')//pass in collection name
})

//create storage engine
const storage= new GridFsStorage({
    url:mongoURI,
    file:(req,file)=>{
        return new Promise((resolve,reject)=>{
            crypto.randomBytes(16,(err,buf)=>{
                if(err){
                    return reject(err)
                }
                const filename=buf.toString('Hex')+path.extname(file.originalname)
                const fileInfo={
                    filename:filename,
                    bucketName:'uploads'//must be the same as collection name
                }
                resolve(fileInfo)
            })
        })
    }
})

const upload = multer({storage})

//displaying image
app.get('/',(req,res)=>{
    //Find all files
    gfs.files.find().toArray((err,files)=>{
        if(!files || files.length===0){
            res.render('index',{files:false})
        }else{
            files.map(file=>{
                if(file.contentType === 'image/jpeg' || file.contentType === 'image/png'){
                    file.isImage=true
                }else{
                    file.isImage=false
                }
            }) 
        }
        res.render('index',{files:files})
    })
})

//uploading file to database
app.post('/upload',upload.single('file'),(req,res)=>{
    //Redirect back to homepage
    res.redirect('/')
})


//route to see all files in db
app.get('/files',(req,res)=>{
    //find files
    gfs.files.find().toArray((err,files)=>{
        //check if files exist
        if(!files || files.length===0){
            return res.status(404).json({
                err : 'No files exist'
            })
        }
        //files exist
        return res.json(files)
    })
})

//route to get a single file by filename
app.get('/files/:filename',(req,res)=>{
    //find file
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        //check if file exist
        if(!file || file.length===0){
            return res.status(404).json({
                err:'No file exist'
            })
        }
        //if file exists
        return res.json(file)
    })
})

//route to get image
app.get('/image/:filename',(req,res)=>{
    //find file
    gfs.files.findOne({filename:req.params.filename},(err,file)=>{
        //check if file exists
        if(!file || file.length===0){
            return res.status(404).json({
                err:'No file exist'
            })
        }
        //check if file is an image
        if(file.contentType==='image/jpeg' || file.contentType==="image/png"){
            //read output to browser
            const readstream = gfs.createReadStream(file.filename)
            readstream.pipe(res)
        }else{
            res.status(404).json({
                err:'Not an image'
            })
        }
    })
    
})

//set view engine
app.set('view engine','ejs')

app.get('/',(req,res)=>{
    res.render('index')
})

const port = 5000
app.listen(port,()=>console.log(`Server started on port ${port}...`))