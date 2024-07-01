const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

//schema
const schemaData = mongoose.Schema({
    email:String,
    password:String

},{
    timestamps:true
})

// Register schema
const registerSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    reEnterPassword: String
}, {
    timestamps: true
})



//read
const userModal = mongoose.model("user",schemaData)
const registerModal = mongoose.model("Register", registerSchema)



app.get("/",async(req,res)=>{
    const data = await userModal.find({})
   res.json({success:true,data:data})
})




//create data //save data in mongodb
app.post("/create",async(req,res)=>{
    console.log(req.body)
    const data = new userModal(req.body)
    await data.save()
    res.send({success:true,message:"data save successfully"})
})

app.put("/updates",async(req,res)=>{
    console.log(req.body)
    const {id, ...rest} = req.body
    console.log(rest)
    await userModal.updateOne({_id:id},rest)
    res.send({success:true,message:"data update successfully"})
})

app.post("/register", async (req, res) => {
    console.log(req.body)
    const data = new registerModal(req.body)
    await data.save()
    res.send({ success: true, message: "Registration data saved successfully" })
})

mongoose.connect("mongodb://localhost:27017/BillSystem")
.then(()=>{
    console.log("connect to db")
    app.listen(PORT,()=>console.log("Server is reading to run!!"))
    
})
.catch((err)=>console.log(err))



