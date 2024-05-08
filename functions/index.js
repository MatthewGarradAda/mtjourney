const {setGlobalOptions} = require('firebase-functions/v2');
const {onRequest} = require("firebase-functions/v2/https");
const {onDocumentCreated, onDocumentUpdated, onDocumentWritten} = require("firebase-functions/v2/firestore");
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue, Filter, Query} = require('firebase-admin/firestore');

const {sendEmail} = require('../src/email');


const url = "http://localhost:3000";
const collection = "donations";


setGlobalOptions({region: 'europe-west2', memory: '128MiB'});
initializeApp();
const db = getFirestore();


exports.newDonation = onRequest(async (request, response) => {
    try { 
        const {giftAidNumber='', email=''} = request.body
        const ref = await db.collection(collection).add({giftAidNumber, email, created: Timestamp.now(), status: 0, profit: null, notes: ''})
        response.send({donationId: ref.id})
    } catch (error) {
        response.send({ok: false, error});
    }
});

exports.addBarcode = onRequest(async (request, response) => {
    try { 
        const {donationId, barcode} = request.body;
        const ref = await db.collection(collection).doc(donationId).update({barcode, generated: Timestamp.now()});
        response.status(200).send({ok: true});
    } catch (error) {
        response.status(500).send({ok:false, error});
    }
});

exports.getDetails = onRequest(async (request, response) => {
    const donationId = request.query.donationId;
    const donationDoc = await db.collection(collection).doc(donationId).get();
    if (donationDoc.exists) {
        response.send(donationDoc.data());
    } else {
        response.send({});
    }
});

exports.updateDetails = onRequest(async (request, response) => {
    try {
        const {barcode} = request.body;
        const donationRefs = await db.collection(collection).where('barcode', '==', barcode).get();
        const donationRef = donationRefs.docs[0].ref;
        const updateData = {};
        // ** do input validation
        if ('status' in request.body) {
            updateData.status = request.body.status;
            // ** Is this the correct way to do timestamp field value?
            updateData.statusTimestamp = Timestamp.now();
        };
        if ('profit' in request.body) {updateData.profit = request.body.profit};
        if ('notes' in request.body) {updateData.notes = request.body.notes};
        await donationRef.update(updateData, {exists: true});
        response.status(200).send({ok: true});
    } catch (error) {
        response.status(500).send({ok: false, error});
    }
});

// exports.addImages = onRequest(async (request, response) => {
//     // ** Get blob, upload to cloud storage, write to images array, return filenames
// })

exports.getGiftAid = onRequest(async (request, response) => {
    const col = db.collection(collection);
    const query = col.where('giftAidNumber', '!=', '');
    const snapshot = await query.get();
    const documents = snapshot.docs.map(doc => doc.data());
    response.send(documents);
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