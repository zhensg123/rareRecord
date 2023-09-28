const express  = require('express')
const app = express()
const cors = require('cors')

app.use(cors())
app.get('/reportData', (req, res)=>{

})

app.post('/reportData', (req, res)=>{
    
})


app.listen(8000, ()=>{
    console.log('hello fd')
})