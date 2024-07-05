const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// User schema
const schemaData = new mongoose.Schema(
  {
    email: String,
    password: String,
  },
  {
    timestamps: true,
  }
);

// Register schema
const registerSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    reEnterPassword: String,
  },
  {
    timestamps: true,
  }
);

// Billing Schema
const BillingSchema = new mongoose.Schema(
  {
    date: Date,
    seller: String,
    purchases: String,
    category: String,
    amount: Number,
    remark: String,
  },
  {
    timestamps: true,
  }
);



// Models
const userModal = mongoose.model("User", schemaData);
const registerModal = mongoose.model("Register", registerSchema);
const Billing = mongoose.model("Billing", BillingSchema);


// Middleware for authentication
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });
  
    try {
      const verified = jwt.verify(token, process.env.JWT_SECRET_KEY);
      req.user = verified;
      next();
    } catch (error) {
      res.status(400).json({ message: 'Invalid token' });
    }
  };

// Generate token function
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "300s" }
  );
};

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      console.log("Login request:", email, password);
  
      // Check if user exists with given email
      const user = await registerModal.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      console.log("User found:", user);
  
      // Verify password using bcryptjs
      const isMatch = await bcrypt.compare(password, user.password);
  
      console.log("Password match result:", isMatch);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Generate JWT token
      const token = generateToken(user); // Assuming generateToken is defined elsewhere
  
      // If credentials are correct
      res.status(200).json({ success: true, message: "Login successful", token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
  
app.get("/homepage", async (req, res) => {
  const billings = await Billing.find();
  res.json(billings);
});

app.post("/homepage", async (req, res) => {
  try {
    const newBilling = new Billing(req.body);
    await newBilling.save();
    res.json(newBilling);
  } catch (error) {
    console.error("Error in POST /homepage:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/homepage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const billing = await Billing.findById(id);
    if (!billing) {
      return res.status(404).json({ message: "Billing record not found" });
    }
    res.json(billing);
  } catch (error) {
    console.error("Error fetching billing record by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a billing record by ID (EDIT FUNCTIONALITY)
app.put("/homepage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const updatedBilling = await Billing.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBilling) {
      return res.status(404).json({ message: "Billing record not found" });
    }
    res.json(updatedBilling);
  } catch (error) {
    console.error("Error in PUT /homepage/:id:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.delete("/homepage/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Billing.findByIdAndDelete(id);
    res.json({ message: "Billing record deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /homepage/:id:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

app.get("/", async (req, res) => {
  const data = await userModal.find({});
  res.json({ success: true, data: data });
});

app.post("/create", async (req, res) => {
  console.log(req.body);
  const data = new userModal(req.body);
  await data.save();
  res.send({ success: true, message: "Data saved successfully" });
});

app.put("/updates", async (req, res) => {
  console.log(req.body);
  const { id, ...rest } = req.body;
  console.log(rest);
  await userModal.updateOne({ _id: id }, rest);
  res.send({ success: true, message: "Data updated successfully" });
});

// app.post("/register", async (req, res) => {
//   console.log(req.body);
//   const data = new registerModal(req.body);
//   await data.save();
//   res.send({ success: true, message: "Registration data saved successfully" });
// });

app.post("/register", async (req, res) => {
    const { name, email, password, reEnterPassword } = req.body;
  
    if (password !== reEnterPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
  
    try {
      // Hash the password before saving
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new registerModal({ name, email, password: hashedPassword, reEnterPassword });
  
      // Save the new user
      await user.save();
  
      // Generate JWT token
      const token = generateToken(user);
      res.status(201).send({ status: "success", message: "Registration successful", token });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Server error", error });
    }
  });
  


mongoose
  .connect("mongodb://localhost:27017/BillSystem")
  .then(() => {
    console.log("Connected to DB");
    app.listen(PORT, () => console.log("Server is ready to run!!"));
  })
  .catch((err) => console.log(err));
