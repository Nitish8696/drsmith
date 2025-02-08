const router = require("express").Router();
const uuid = require("uuid");

var https = require("follow-redirects").https;
var fs = require("fs");

const express = require("express");
const Order = require("../models/Order");
const Cart = require("../models/Cart");
const axios = require("axios");
const Product = require("../models/Product");


router.use(express.urlencoded({ extended: true }));
const nodemailer = require("nodemailer");


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

async function updateProductStock(transactionId) {
  try {
    // Find the order by transactionId
    const order = await Order.findOne({
      _id: transactionId,
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


router.get("/payment/:id", async (req, res) => {
  const { cartId } = req.cookies;
  try {
    const cod = await Order.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { status: "COD" } },
      { new: true }
    );
    const removeCart = await Cart.findOneAndDelete({ cartId: cartId });
    updateProductStock(req.params.id);
    try {
      const createOrderPayload = (order) => {
        const { address, products, amount, transationId } = order;

        // Map products into ShipRocket's format
        const shiprocketItems = products.map((product) => ({
          name: product.title,
          sku: "DUMMY_SKU", // Use variable SKU if available
          units: product.quantity,
          selling_price: product.salePrice, // Use variable price if available
          discount: 0, // Adjust if discounts are applied
          tax: 0, // Adjust if applicable
          hsn: 441122,
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
          console.log(token);
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

      const orderDetailsPayload = createOrderPayload(cod);
      createOrder(orderDetailsPayload);

        const sendMessage = await axios.post(
          "https://backend.aisensy.com/campaign/t1/api/v2",
          {
            apiKey:
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWVkMDMwOTM1YTBmMGJmZDUwZDk1NyIsIm5hbWUiOiJiYWxhamkgdGVjaCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NjVlZDAzMDkzNWEwZjBiZmQ1MGQ5NDgiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcxNzQ4OTcxMn0.cTUUG12_fUYLUrniVLs1lRZL_5zmZzcbLu1DrofYMdU",
            campaignName: "orderconfirmwithtracking",
            destination: `91${cod.address.phone}`,
            userName: "Drsmithflexibles",
            templateParams: [
              `${cod.address.fname}`,
              `${cod.address.address}, ${cod.address.city}, ${cod.address.state}, ${cod.address.pincode}`,
              `${cod.transationId}`
            ],
          }
        );
        const titles = cod.products
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
      const quantity = cod.products
        .map((product) => product.quantity)
        .join(", ");
      const salePrice = cod.products
        .map((product) => product.salePrice)
        .join(", ");

      const sendMessageTwo = await axios.post(
        "https://backend.aisensy.com/campaign/t1/api/v2",
        {
          apiKey:
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NWVkMDMwOTM1YTBmMGJmZDUwZDk1NyIsIm5hbWUiOiJiYWxhamkgdGVjaCIsImFwcE5hbWUiOiJBaVNlbnN5IiwiY2xpZW50SWQiOiI2NjVlZDAzMDkzNWEwZjBiZmQ1MGQ5NDgiLCJhY3RpdmVQbGFuIjoiQkFTSUNfTU9OVEhMWSIsImlhdCI6MTcxNzQ4OTcxMn0.cTUUG12_fUYLUrniVLs1lRZL_5zmZzcbLu1DrofYMdU",
          campaignName: "sarabjeetsirnotification",
          destination: `8696702772`,
          userName: "Drsmithflexibles",
          templateParams: [
            `${cod.address.fname}`,
            `${cod.address.address},${cod.address.phone}, ${cod.address.city}, ${cod.address.state}, ${cod.address.pincode}, ${cod.address.phone}`,
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
        to: "nitihchoudhary8696@gmail.com",
        subject: "New Order",
        html: `${cod.address.fname},${cod.address.address},${cod.address.phone}, ${cod.address.city}, ${cod.address.state}, ${cod.address.pincode}, ${cod.address.phone} || 
        Product : - ${titles} || Quantity : - ${quantity} || Price : - ${salePrice}
        `,
      });
    } catch (sendError) {
      console.error("Error sending message:", sendError.message);
    }
    res.json({ cod: cod, status: 200 });
  } catch (error) {
    res.json({ error: error.message, status: 500 });
  }
});

module.exports = router;
