const router = require("express").Router();
const axios = require("axios");
const crypto = require("crypto");
const express = require("express");
const Order = require("../models/Order");
const cron = require("node-cron");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");
const nodemailer = require("nodemailer");


router.use(express.urlencoded({ extended: true }));

const authenticate = async () => {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
        email: "amar77928696@gmail.com",
        password: "Kitkat@123",
      }
    );
    return response.data.token; // Save this token securely for future use.
  } catch (error) {
    console.error("Authentication failed:", error.message);
  }
};

router.get("/payment/:id", async (req, res) => {
  //   const { cartId } = req.cookies.cartId;
  //   console.log(cartId)

  const order = await Order.findById(req.params.id);
  const data = {
    merchantId: "M22DZ8AZR4P8J",
    merchantTransactionId: order.transationId,
    merchantUserId: "MUID123",
    amount: order.amount * 100,
    redirectUrl: `https://drsmithflexibles.com/success/PAYMENT_SUCCESS/${order.transationId}`,
    redirectMode: "REDIRECT",
    callbackUrl: `https://drsmithf.inpro2.fcomet.com/api/checkout/status/${order.transationId}/${req.cookies.cartId}`,
    mobileNumber: "9999999999",
    paymentInstrument: {
      type: "PAY_PAGE",
    },
  };
  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const key = "fb11f6b3-a18e-4247-ba18-e2dddbe92d7b";
  const keyIndex = 1;
  const string = payloadMain + "/pg/v1/pay" + key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

  const options = {
    method: "post",
    url: URL,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
    },
    data: {
      request: payloadMain,
    },
  };
  axios
    .request(options)
    .then(function (response) {
      return res
        .status(200)
        .send(response.data.data.instrumentResponse.redirectInfo.url);
    })
    .catch(function (error) {
      console.error(error);
    });
});

async function updateProductStock(transactionId) {
  try {
    // Find the order by transactionId
    const order = await Order.findOne({
      transationId: transactionId,
      isQuantityRemoved: false,
    });

    if (!order) {
      console.log("Order not found or stock already updated.");
      return;
    }

    // Iterate through the products in the order
    for (const orderedProduct of order.products) {
      const product = await Product.findById(orderedProduct.productId);

      if (!product) {
        console.log(`Product with ID ${orderedProduct.productId} not found.`);
        continue;
      }

      if (orderedProduct.variable) {
        // If variable is not null, find the matching variation
        const variation = product.variations.find((v) =>
          Object.entries(orderedProduct.variable).every(
            ([key, value]) => v.attributeCombination.get(key) === value
          )
        );

        if (variation) {
          // Reduce the stock of the variation
          if (variation.stock >= orderedProduct.quantity) {
            variation.stock -= orderedProduct.quantity;
          } else {
            console.log(
              `Insufficient stock for variation in product ${product._id}.`
            );
            continue;
          }
        } else {
          console.log(
            `No matching variation found for product ${product._id}.`
          );
          continue;
        }
      } else {
        // If variable is null, reduce the main product stock
        if (product.inStock >= orderedProduct.quantity) {
          product.inStock -= orderedProduct.quantity;
        } else {
          console.log(`Insufficient stock for product ${product._id}.`);
          continue;
        }
      }

      // Save the updated product
      await product.save();
    }

    // Update the order's isQuantityRemoved flag
    order.isQuantityRemoved = true;
    await order.save();

    console.log("Stock updated successfully.");
  } catch (error) {
    console.error("Error updating stock:", error);
  }
}

router.post("/status/:txnId/:cartId?", async (req, res) => {
  const merchantId = "M22DZ8AZR4P8J";
  const SALT_KEY = "fb11f6b3-a18e-4247-ba18-e2dddbe92d7b";
  const keyIndex = 1;
  const string = `/pg/v1/status/${merchantId}/${req.params.txnId}` + SALT_KEY;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;
  const options = {
    method: "get",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${req.params.txnId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };
  try {
    const response = await axios.request(options);
    if (response.data.code === "PAYMENT_SUCCESS") {
      const removeCart = await Cart.findOneAndDelete({
        cartId: req.params.cartId,
      });
      const order = await Order.findOneAndUpdate(
        { transationId: response.data.data.merchantTransactionId },
        { $set: { status: "PAYMENT_SUCCESS" } },
        { new: true }
      );
      updateProductStock(req.params.txnId);
      const createOrderPayload = (order) => {
        const { address, products, amount, transationId } = order;

        // Map products into ShipRocket's format
        const shiprocketItems = products.map((product) => ({
          name: product.title,
          sku: uuidv4(), // Unique SKU
          units: product.quantity,
          selling_price: product.salePrice, // Use variable price if available
          discount: 0, // Adjust if discounts are applied
          tax: 0, // Adjust if applicable
          hsn: Math.floor(100000 + Math.random() * 900000),
        }));

        // Construct the order payload
        const orderDetails = {
          order_id: transationId,
          order_date: new Date().toISOString(),
          pickup_location: "Primary", // Set your pickup location name
          channel_id: "5427560", // Optional, set if needed
          comment: "Website Order", // Add any comments if required
          billing_customer_name: address.fname,
          billing_last_name: address.lname,
          billing_address: address.address,
          billing_city: address.city,
          billing_pincode: address.pincode,
          billing_state: address.state,
          billing_country: "India", // Change as required
          billing_email: "drsmith@gmial.com", // Add email if available
          billing_phone: address.phone,
          shipping_is_billing: true, // Set to false if shipping and billing are different
          shipping_customer_name: "",
          shipping_last_name: "",
          shipping_address: "",
          shipping_address_2: "",
          shipping_city: "",
          shipping_pincode: "",
          shipping_country: "",
          shipping_state: "",
          shipping_email: "",
          shipping_phone: "",
          order_items: shiprocketItems,
          payment_method: order.status === "COD" ? "COD" : "Prepaid",
          shipping_charges: 0, // Adjust if shipping charges are applied
          giftwrap_charges: 0, // Adjust if gift wrap charges are applied
          transaction_charges: 0, // Adjust if transaction charges are applied
          total_discount: 0, // Adjust if discounts are applied
          sub_total: amount, // Subtotal before taxes
          length: 10, // Adjust as per package dimension
          breadth: 10, // Adjust as per package dimension
          height: 10, // Adjust as per package dimension
          weight: 0.5, // Adjust as per package weight
        };

        return orderDetails;
      };

      const createOrder = async (orderDetails) => {
        try {
          const token = await authenticate();
          const response = await axios.post(
            "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
            orderDetails,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          return response.data;
        } catch (error) {
          console.error("Error creating order:", error.message);
        }
      };

      const orderDetailsPayload = createOrderPayload(order);
      createOrder(orderDetailsPayload);

      const sendMessage = await axios.post(
        "https://backend.aisensy.com/campaign/t1/api/v2",
        {
          apiKey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWVkMDMwOTM1YTBmMGJmZDUwZDk1NyIsIm5hbWUiOiJiYWxhamkgdGVjaCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NjVlZDAzMDkzNWEwZjBiZmQ1MGQ5NDgiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcxNzQ4OTcxMn0.cTUUG12_fUYLUrniVLs1lRZL_5zmZzcbLu1DrofYMdU",
          campaignName: "orderconfirmwithtracking",
          destination: `91${order.address.phone}`,
          userName: "Drsmithflexibles",
          templateParams: [
            `${order.address.fname}`,
            `${order.address.address}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}`,
            `${response.data.data.merchantTransactionId}`,
          ],
        }
      );
      
      const titles = order.products
        .map((product) => {
          // Extract the title
          let fullTitle = product.title;

          // Check if `variable` exists and add its values
          if (product.variable) {
            const variableValues = Object.values(product.variable).join(", ");
            fullTitle += ` (${variableValues})`;
          }

          return fullTitle;
        })
        .join(", ");
      const quantity = order.products
        .map((product) => product.quantity)
        .join(", ");
      const salePrice = order.products
        .map((product) => product.salePrice)
        .join(", ");

      const sendMessageTwo = await axios.post(
        "https://backend.aisensy.com/campaign/t1/api/v2",
        {
          apiKey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWVkMDMwOTM1YTBmMGJmZDUwZDk1NyIsIm5hbWUiOiJiYWxhamkgdGVjaCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NjVlZDAzMDkzNWEwZjBiZmQ1MGQ5NDgiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcxNzQ4OTcxMn0.cTUUG12_fUYLUrniVLs1lRZL_5zmZzcbLu1DrofYMdU",
          campaignName: "sarabjeetsirnotification",
          destination: `7890904646`,
          userName: "Drsmithflexibles",
          templateParams: [
            `${order.address.fname}`,
            `${order.address.address}, ${order.address.phone}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}, ${order.address.phone}`,
            `-----`,
            `Product : - ${titles} || Quantity : - ${quantity} || Price : - ${salePrice}`,
          ],
        }
      );
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT === "465", // true for SSL, false for TLS
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: "drsmithflexibles@gmail.com",
        subject: "New Order",
        html: `${order.address.fname},${order.address.address},${order.address.phone}, ${order.address.city}, ${order.address.state}, ${order.address.pincode}, ${order.address.phone} || 
        Product : - ${titles} || Quantity : - ${quantity} || Price : - ${salePrice}
        `,
      });
      res.status(200).json({ message: "Success" });
    } else if (response.data.code === "PAYMENT_ERROR") {
      await Order.updateOne(
        { transationId: response.data.data.merchantTransactionId },
        { $set: { status: "PAYMENT_ERROR" } }
      );
      res.status(200).json({ message: "Error" });
    } else if (response.data.code === "PAYMENT_PENDING") {
      await Order.updateOne(
        { transationId: response.data.data.merchantTransactionId },
        { $set: { status: "PAYMENT_PENDING" } }
      );
      res.status(200).json({ message: "Pending" });
    } else if (response.data.code === "INTERNAL_SERVER_ERROR") {
      await Order.updateOne(
        { transationId: response.data.data.merchantTransactionId },
        { $set: { status: "INTERNAL_SERVER_ERROR" } }
      );
      res.status(200).json({ message: "Internal" });
    } else {
      await Order.updateOne(
        { transationId: response.data.data.merchantTransactionId },
        { $set: { status: "PAYMENT_ERROR" } }
      );
      res.status(200).json({ message: "Error" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred");
  }
});

async function checkTransactionStatus(transactionId) {
  try {
    const merchantId = "M22DZ8AZR4P8J";
    const SALT_KEY = "fb11f6b3-a18e-4247-ba18-e2dddbe92d7b";
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${transactionId}` + SALT_KEY;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;
    const options = {
      method: "get",
      url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${transactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": `${merchantId}`,
      },
    };
    const response = await axios.request(options);
    return response.data.code;
  } catch (error) {
    console.error("Error checking transaction status:", error);
    return null;
  }
}
async function updateDocumentStatus() {
  try {
    // Retrieve documents with status "Pending payment"
    const pendingOrders = await Order.find({
      status: { $in: ["PAYMENT_PENDING", "INTERNAL_SERVER_ERROR"] },
    });

    // Loop through retrieved documents
    if (pendingOrders.length > 0) {
      for (const order of pendingOrders) {
        const transationId = order.transationId;

        // Check transaction status using API
        const newStatus = await checkTransactionStatus(transationId);

        if (newStatus) {
          // Update document status
          await Order.updateOne(
            { transationId: transationId },
            { $set: { status: newStatus } }
          );
          console.log(
            `Updated status for transaction ${transationId} to ${newStatus}`
          );
        } else {
          console.log(
            `Failed to update status for transaction ${transationId}`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error updating document status:", error);
  }
}

cron.schedule("0 */3 * * *", async () => {
  console.log("Running task to update document status...");
  await updateDocumentStatus();
});

module.exports = router;
