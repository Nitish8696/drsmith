const router = require("express").Router();
const ConfirmOrder = require("../models/ConfirmOrder");
const axios = require('axios');
const crypto = require('crypto');
const express = require('express')
const Order = require("../models/Order");

router.use(express.urlencoded({ extended: true }))

router.post("/payment", (req, res) => {
    const transactionId = "Tr" + Date.now().toString()
    const data = {
        merchantId: "PGTESTPAYUAT",
        merchantTransactionId: transactionId,
        merchantUserId: "MUID123",
        amount: req.body.data.amount * 100,
        redirectUrl : `http://localhost:5000/api/checkout/status/${transactionId}/${req.body.data.id}`,
        redirectMode : "POST",
        callbackUrl: `http://localhost:5000/api/checkout/status/${transactionId}/${req.body.data.id}`,
        mobileNumber: "9999999999",
        paymentInstrument: {
            type: "PAY_PAGE"
        }
    }
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const key = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399";
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    const URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay"

    const options = {
        method: 'post',
        url: URL,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum
        },
        data: {
            request: payloadMain
        }
    };
    axios
        .request(options)
        .then(function (response) {
            return res.status(200).send(response.data.data.instrumentResponse.redirectInfo.url)
        })
        .catch(function (error) {
            console.error(error);
        });
})

router.post('/status/:txnId/:id', async (req, res) => {
    const order = await Order.findById(req.params.id)
    if(req.body.code === 'PAYMENT_SUCCESS'){
      const confirmOrder = new ConfirmOrder({
        userId : order.userId,
        products : order.products,
        amount : order.amount,
        address : order.address
      })
      const corder = await confirmOrder.save()
      const deleteOrder = await Order.findByIdAndDelete(req.params.id)
      res.redirect(`http://localhost:3000/success/${req.body.code}/${corder._id}`)
    }
    if(req.body.code === 'PAYMENT_ERROR'){
      res.redirect(`http://localhost:3000/error/${req.body.code}`)
    }
    if(req.body.code === 'INTERNAL_SERVER_ERROR'){
      res.redirect(`http://localhost:3000/error/${req.body.code}`)
    }
})


module.exports = router;