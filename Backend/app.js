require('dotenv').config();
const express = require("express");
const app = express();
const propertyRouter = require("./routes/propertyRouter");
const userRouter = require("./routes/userRouter");
const { unknownEndpoint, errorHandler } = require("./middleware/customMiddleware");
const connectDB = require("./config/db");
const cors = require("cors");


app.use(cors());
app.use(express.json());

connectDB();


app.use("/api/properties", propertyRouter);

// UserRouter
app.use("/api/users", userRouter);

app.use(unknownEndpoint);
app.use(errorHandler);


app.listen(process.env.PORT, () => {
  const port = process.env.PORT || 4000;
  console.log(`Server running on port ${port}`);
  

  console.log(`Available Routes:`);
  console.log(`1. Properties API: http://localhost:${port}/api/properties`);
  console.log(`2. Users API: http://localhost:${port}/api/users/login`);
  console.log(`2. Users API: http://localhost:${port}/api/users/signup`);
});

module.exports = app;
