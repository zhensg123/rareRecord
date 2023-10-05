const express  = require('express')
const app = express()
const cors = require('cors')

const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text())

app.get('/reportData', (req, res)=>{
    console.log(req.query, 'hello fd get reportData')
    res.end('hello fd get reportData')

})

app.get('/', (req, res)=>{
    res.end('hello fd')
})

app.post('/reportData', (req, res)=>{
    console.log(req.body, 'hello fd post reportData')
    res.status(200).send('')
})


app.listen(8000, ()=>{
    console.log('hello fd post')
})