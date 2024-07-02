const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');

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

//Billing Schema
const BillingSchema = new mongoose.Schema({
    date: Date,
    seller: String,
    purchases:String,
    category: String,
    amount: Number,
    remark: String,
  },{
    timestamps: true
  })


//read
const userModal = mongoose.model("user",schemaData)
const registerModal = mongoose.model("Register", registerSchema)
const Billing = mongoose.model('Billing', BillingSchema);


app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists with given email
        const user = await Register.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password using bcryptjs
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // If credentials are correct
        res.status(200).json({ success: true, message: "Login successful" });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


app.get('/homepage', async (req, res) => {
    const billings = await Billing.find();
    res.json(billings);
  });
  
  app.post('/homepage', async (req, res) => {
    try {
        const newBilling = new Billing(req.body);
        await newBilling.save();
        res.json(newBilling);
    } catch (error) {
        console.error('Error in POST /homepage:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});


app.get('/homepage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const billing = await Billing.findById(id);
        if (!billing) {
            return res.status(404).json({ message: 'Billing record not found' });
        }
        res.json(billing);
    } catch (error) {
        console.error('Error fetching billing record by ID:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});



// Update a billing record by ID (EDIT FUNCTIONALITY)
app.put('/homepage/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }
        const updatedBilling = await Billing.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBilling) {
            return res.status(404).json({ message: 'Billing record not found' });
        }
        res.json(updatedBilling);
    } catch (error) {
        console.error('Error in PUT /homepage/:id:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});



  app.delete('/homepage/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Billing.findByIdAndDelete(id);
      res.json({ message: 'Billing record deleted successfully' });
    } catch (error) {
      console.error('Error in DELETE /homepage/:id:', error);
      res.status(500).json({ message: 'Server error', error });
    }
  });
  
  



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



