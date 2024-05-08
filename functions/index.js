const {setGlobalOptions} = require('firebase-functions/v2');
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated, onDocumentWritten} = require("firebase-functions/v2/firestore");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, Query} = require('firebase-admin/firestore');

const {sendEmail} = require('../src/email');
const {createDonation, addBarcode, addOutcome, getDonation, getGiftAid} = require('../src/database');
const {url, collection} = require('../src/constants');


setGlobalOptions({region: 'europe-west2', memory: '128MiB'});
initializeApp();
const db = getFirestore();


exports.newDonation = onRequest(async (request, response) => {
    try { 
        const {giftAidNumber='', email=''} = request.body;
        const ref = await createDonation(db, Timestamp.now(), giftAidNumber, email);
        response.send({donationId: ref.id});
    } catch (error) {
        console.log(error)
        response.status(500).send({ok: false, error: error.message});
    }
});

exports.addBarcode = onRequest(async (request, response) => {
    try { 
        const {donationId, barcode} = request.body;
        const ref = await addBarcode(db, Timestamp.now(), donationId, barcode);
        response.status(200).send({ok: true});
    } catch (error) {
        console.log(error)
        response.status(500).send({ok: false, error: error.message});
    }
});

exports.updateDetails = onRequest(async (request, response) => {
    try {
        const {barcode} = request.body;
        const updateData = {};
        // ** do input validation
        if ('status' in request.body) {
            updateData.status = request.body.status;
            updateData.statusTimestamp = Timestamp.now()
        };
        if ('profit' in request.body) {updateData.profit = request.body.profit};
        if ('notes' in request.body) {updateData.notes = request.body.notes};
        const ok = addOutcome(db, barcode, updateData);
        response.status(200).send({ok: true});
    } catch (error) {
        console.log(error)
        response.status(500).send({ok: false, error: error.message});
    }
});

// exports.addImages = onRequest(async (request, response) => {
//     // ** Get blob, upload to cloud storage, write to images array, return filenames
// })

exports.getDetails = onRequest(async (request, response) => {
    const {donationId} = request.query;
    response.send(await getDonation(db, donationId))
});

exports.getGiftAid = onRequest(async (request, response) => {
    response.send(await getGiftAid(db));
});

exports.newDonationWatcher = onDocumentCreated(`/${collection}/{donationId}`, (event) => {
    // ** Handle error - logging?
    const email = event.data.get('email');
    try {
        if (email) {
            const text =  `Thank you for your donation to Mustard Tree!\n\nWe believe in the importance of accountability to our donors, that's why we are tracking the journey of your item to see the impact it will have.\nClick the link below to see your personal tracking page, you will also receive an update when your item has been received.\n${url}/${event.data.id}`;
            const emailSent = sendEmail(email, 'Track Your Donation', text);
        }   
    } catch (err) {
        console.log({err})
    }
});

exports.donationStatusWatcher = onDocumentWritten(`/${collection}/{donationId}`, (event) => {
    // ** Handle error - logging?
    const id = event.data.after.id;
    const prevStatus = Number(event.data.before.get('status'))
    const status = Number(event.data.after.get('status'))
    const email = event.data.after.get('email')
    if (email && prevStatus === 0 && status !== 0) {
        const text =  `Good news, your donation to Mustard Tree has found a new home.\nClick below to find out more!\n${url}/${id}`;
        const emailSent = sendEmail(email, 'Track Your Donation', text);
    }
});