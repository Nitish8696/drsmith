const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user")
const authRoute = require("./routes/auth")
const productRoute = require("./routes/product")
const cartRoute = require("./routes/cart")
const orderRoute = require("./routes/order")
const stripeRoute = require("./routes/stripe")
const reviewRoute = require("./routes/review")
const searchRoute = require("./routes/search")
const categoryRoute = require("./routes/category")
const cors = require("cors")
const bodyParser = require('body-parser');



dotenv.config();
mongoose.connect(
    process.env.MONO_URL
).then(()=> console.log("DB connection established")).catch((err)=> console.log(err));

app.use(cors());
app.use(express.json());
app.use(express.static('public'))
app.use("/api/auth", authRoute)
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);
app.use("/api/review", reviewRoute);
app.use("/api/search", searchRoute);
app.use("/api/category", categoryRoute);
app.use(express.json())

app.listen(process.env.PORT || 5000,()=>{
    console.log("bacend is runing")
})