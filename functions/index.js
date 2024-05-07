const {setGlobalOptions} = require('firebase-functions/v2')
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated, onDocumentWritten} = require("firebase-functions/v2/firestore")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, } = require('firebase-admin/firestore');

const {sendEmail} = require('../src/email')
const {url, collection} = require('../constants')


setGlobalOptions({region: 'europe-west2', memory: '128MiB'})
initializeApp();
const db = getFirestore();


exports.newDonation = onRequest(async (request, response) => {
    try { 
        const {barcode, giftAidNumber='', email=''} = request.body
        // ** Is this the correct way to do timestamp field value?
        const ref = await db.collection(collection).add({barcode, giftAidNumber, email, created: Timestamp})
        response.send(ref.id)
    } catch (error) {
        response.send({ok: false, error});
    }
});

exports.getDetails = onRequest(async (request, response) => {
    const donationId = request.donationId;
    const donationDoc = await db.collection(collection).doc(donationId).get();
    if (donationDoc.exists) {
        response.send(donationDoc.data());
    } else {
        response.send({});
    }
});

exports.updateDetails = onRequest(async (request, response) => {
    try {
        // ** Going to fail if a value is undefined
        // const {donationId, status, notes, profit} = request.body;
        const {donationId} = request.body
        const donationRef = db.collection(collection).doc(donationId);
        const updateData = {};
        // ** do input validation
        if ('status' in request.body) {
            updateData.status = request.body.status
            // ** Is this the correct way to do timestamp field value?
            updateData.statusTimestamp = Timestamp
        };
        if ('profit' in request.body) {updateData.profit = request.body.profit};
        if ('notes' in request.body) {updateData.notes = request.body.notes};
        await donationRef.update(updateData, {exists: true});
        response.status(200).send();
    } catch (err) {
        response.status(404).send();
    }
});

// exports.addImages = onRequest(async (request, response) => {
//     // ** Get blob, upload to cloud storage, write to images array, return filenames
// })

exports.getGiftAid = onRequest(async (request, response) => {
    // ** Read all documents with a giftAid parameter (+ requested timerange?) and get status and÷ profit
})

exports.newDonationWatcher = onDocumentCreated(`/${collection}/{donationId}`, (event) => {
    // ** Handle error - logging?
    const donationData = event.data()
    // ** Check this is correct access, do input validation
    if (donationData.email) {
        const text =  `
        Thank you for your donation to Mustard Tree!

        We believe in the importance of accountability to our donors, that's why we are tracking the journey of your item to see the impact it will have.
        Click the link below to see your personal tracking page, you will also receive an update when your item has been received.
        ${url}/${event.id}
        `
        const emailSent = sendEmail(donationData.email, 'Track Your Donation', text);
    }
});

exports.donationStatusWatcher = onDocumentWritten(`/${collection}/{donationId}`, (event) => {
    // ** Handle error - logging?
    const donationData = event.data()
    // ** Check this is correct access, do input validation
    if (donationData.status !== 0) {
        const text =  `
        Good news, your donation to Mustard Tree has found a new home.
        Click below to find out more!
        ${url}/${event.id}
        `
        const emailSent = sendEmail(donationData.email, 'Track Your Donation', text);
    }
});