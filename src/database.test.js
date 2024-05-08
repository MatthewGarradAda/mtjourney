const { initializeApp, getApps} = require('firebase-admin/app');
const { getFirestore, Timestamp} = require('firebase-admin/firestore');

const {sendEmail} = require('../src/email');
const {createDonation, addBarcode, addOutcome, getDonation, getGiftAid} = require('../src/database');
const {url, collection} = require('../src/constants');


process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
initializeApp({projectId: 'mustardtree-6b33e'});
const db = getFirestore();


// // MOCKS
// let db;
// beforeEach(async () => {
//     // ** Need this to restart firebase emulators instance instead (run within emulators suite?)
//     initializeApp({projectId: 'mustardtree-6b33e'});
//     db = getFirestore();
// });

// afterEach(async () => {
//     await Promise.all(getApps().map(app => app.delete()));
// });


describe('Testing firebase', () => {
    test('Create a donation and read data', async () => {
        const donationRef = await createDonation(db, Timestamp.now(), '123', '');
        const donationId = donationRef.id;
        const donation = await getDonation(db, donationId)
        expect(donation).toMatchObject({email: '', giftAidNumber: '123', status: 0})
        expect(donation).toHaveProperty('created')
    });

    test('Create a donation and add a barcode to it', async () => {
        const donationRef = await createDonation(db, Timestamp.now(), '123', '');
        const donationId = donationRef.id;
        const result = await addBarcode(db, Timestamp.now(), donationId, '0000')
        expect(result).toBeTruthy()
        const donation = await getDonation(db, donationId)
        expect(donation).toMatchObject({barcode: '0000'})
        expect(donation).toHaveProperty('generated')
    });

    test('Create a donation, add barcode and update status', async () => {
        const barcode = Math.random().toString(36).substring(2, 10);
        const notes = 'Your sofa was sold in our Ancoats store';
        const profit = 120;
        const status = 99;
        const donationRef = await createDonation(db, Timestamp.now(), '123', '');
        const donationId = donationRef.id;
        const result = await addBarcode(db, Timestamp.now(), donationId, barcode);
        expect(result).toBeTruthy();
        const updateResult = await addOutcome(db, barcode, {status, notes, profit});
        expect(updateResult).toBeTruthy();
        const donation = await getDonation(db, donationId);
        expect(donation).toMatchObject({email: '', giftAidNumber: '123', status, barcode, profit, notes});
    });

    test('Create a donation and have it appear as gift aid', async () => {
        const donationRef = await createDonation(db, Timestamp.now(), '123', '');
        const docs = await getGiftAid(db);
        console.log(docs)
        expect(docs[0]).toMatchObject({giftAidNumber: '123'});
    });
})