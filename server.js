const express = require('express');
const app = express();
require('dotenv').config();
const dbConfig = require('./config/dbConfig');
app.use(express.json());
const userRoute = require('./routes/userRoute');
const adminRoute = require('./routes/adminRoute');
const clinicRoute = require('./routes/clinicRoute');
const path = require("path");

const User = require('./models/userModel.js');

// Use middleware --> app.use()
app.use('/api/user', userRoute);
app.use('/api/admin', adminRoute);
app.use('/api/clinic', clinicRoute);
      
// Serving static files
app.use(express.static(__dirname + '/public'));
app.use("/",express.static("build"))
app.get("*", (req, res)=>{
  res.sendFile(path.resolve(__dirname,"build/index.html"))
})

app.get("/hello", (req, res)=>{
  res.send("hello")
})
// 5000
const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
