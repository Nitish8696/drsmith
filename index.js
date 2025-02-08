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
const postcategoryRoute = require("./routes/postcategory")
const addpostRoute = require("./routes/addpost")
const variationRoute = require("./routes/variations")
const attributeRoute = require('./routes/attributes')
const codRoute = require('./routes/cod')
const blogimageupload = require('./routes/blogimageupload')
const formRoute = require('./routes/formsubmition')
const brandRoute = require('./routes/brand')
const cartpageRoute = require('./routes/cartpagedetails')
const bannerRoute = require('./routes/bannerimage')
const couponRoute = require("./routes/coupon")
const codLimitRoute = require("./routes/codlimit")
const shippingRoute = require("./routes/Shipping")
const cors = require("cors")
const bodyParser = require('body-parser');
const multer = require('multer');
const cookieParser = require('cookie-parser'); // Import cookie-parser

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));


dotenv.config();
mongoose.connect(
    process.env.MONO_URL
).then(()=> console.log("DB connection established")).catch((err)=> console.log(err));

app.use(cors({
    origin: 'http://localhost:5173', // Frontend origin
    credentials: true // Allow cookies to be sent with requests
}));

app.use(express.json());
app.use(express.static('public'))
app.use("/api/auth", authRoute)
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);
app.use("/api/cod", codRoute);
app.use("/api/form", formRoute);
app.use("/api/review", reviewRoute);
app.use("/api/search", searchRoute);
app.use("/api/category", categoryRoute);
app.use("/api/post", addpostRoute);
app.use("/api/postcategory", postcategoryRoute);
app.use("/api/brandcategory", brandRoute);
app.use("/api/blogimage", blogimageupload);
app.use("/api/cartpagedetails", cartpageRoute);
app.use("/api/products-variation", variationRoute);
app.use("/api/products-attribute", attributeRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/codlimit", codLimitRoute);
app.use("/api/shipping", shippingRoute);



app.listen(process.env.PORT || 4000,()=>{
    console.log("bacend is runing")
})