const router = require("express").Router();
const axios = require('axios');
const crypto = require('crypto');
const express = require('express')
const Order = require("../models/Order");
const cron = require('node-cron');

router.use(express.urlencoded({ extended: true }))

router.get("/payment/:id", async (req, res) => {
    const order = await Order.findById(req.params.id)
    const data = {
        merchantId: "PGTESTPAYUAT",
        merchantTransactionId: order.transationId,
        merchantUserId: "MUID123",
        amount: order.amount * 100,
        redirectUrl: `http://localhost:8000/api/checkout/status/${order.transationId}`,
        redirectMode: "POST",
        callbackUrl: `http://localhost:8000/api/checkout/status/${order.transationId}`,
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

router.post('/status/:txnId', async (req, res) => {
    const merchantId = "PGTESTPAYUAT"
    const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${req.params.txnId}` + SALT_KEY;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;
    const options = {
        method: 'get',
        url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${req.params.txnId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        },
    };
    try {
        const response = await axios.request(options);

        if (response.data.code === 'PAYMENT_SUCCESS') {
            await Order.updateOne({ transactionId: response.data.merchantTransactionId }, { $set: { status: 'PAYMENT_SUCCESS' } });
            res.redirect('http://localhost:3000/success');
        } else if (response.data.code === 'PAYMENT_ERROR') {
            await Order.updateOne({ transactionId: response.data.merchantTransactionId }, { $set: { status: 'PAYMENT_ERROR' } });
            res.redirect('http://localhost:3000/error')
        } else if (response.data.code === 'PAYMENT_PENDING') {
            await Order.updateOne({ transactionId: response.data.merchantTransactionId }, { $set: { status: 'PAYMENT_PENDING' } });
            res.redirect('http://localhost:3000/pending')
        } else if (response.data.code === 'INTERNAL_SERVER_ERROR') {
            await Order.updateOne({ transactionId: response.data.merchantTransactionId }, { $set: { status: 'INTERNAL_SERVER_ERROR' } });
            res.redirect('http://localhost:3000/pending')
        }
        else {
            await Order.updateOne({ transactionId: response.data.merchantTransactionId }, { $set: { status: 'PAYMENT_ERROR' } });
            res.redirect('http://localhost:3000/error')
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred');
    }
})

async function checkTransactionStatus(transactionId) {
    try {
        const merchantId = "PGTESTPAYUAT"
        const SALT_KEY = "099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
        const keyIndex = 1;
        const string = `/pg/v1/status/${merchantId}/${transactionId}` + SALT_KEY;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + "###" + keyIndex;
        const options = {
            method: 'get',
            url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum,
                'X-MERCHANT-ID': `${merchantId}`
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
        const pendingOrders = await Order.find({ status: { $in: ['PAYMENT_PENDING', 'INTERNAL_SERVER_ERROR'] } });
        
        // Loop through retrieved documents
        if(pendingOrders.length > 0) {
            for (const order of pendingOrders) {
                const transationId = order.transationId;
    
                // Check transaction status using API
                const newStatus = await checkTransactionStatus(transationId);
                
                if (newStatus) {
                    // Update document status
                    await Order.updateOne({ transationId: transationId }, { $set: { status: newStatus } });
                    console.log(`Updated status for transaction ${transationId} to ${newStatus}`);
                } else {
                    console.log(`Failed to update status for transaction ${transationId}`);
                }
            }
        }
    } catch (error) {
        console.error("Error updating document status:", error);
    }
}

cron.schedule('*/15 * * * *', async () => {
    console.log('Running task to update document status...');
    await updateDocumentStatus();
});



module.exports = router;