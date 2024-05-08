const {collection} = require('./constants');


function createDonation(db, created, giftAidNumber='', email='') {
    return db.collection(collection).add({giftAidNumber, email, created, status: 0, profit: null, notes: ''})
}

function addBarcode(db, generated, donationId, barcode) {
    return db.collection(collection).doc(donationId).update({barcode, generated});
}

function addOutcome(db, barcode, keys) {
    return new Promise((resolve, reject) => {
        db.collection(collection).where('barcode', '==', barcode).get()
            .then((donationRefs) => {
                const donationRef = donationRefs.docs[0].ref;
                donationRef.update(keys, { exists: true })
                    .then(() => {
                        resolve(true);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            })
            .catch((error) => {
                reject(error);
            });
    });
}

async function getDonation(db, donationId) {
    const donationDoc = await db.collection(collection).doc(donationId).get();
    if (donationDoc.exists) {
        return donationDoc.data();
    } else {
        return {}
    }
}

async function getGiftAid(db) {
    const col = db.collection(collection);
    const query = col.where('giftAidNumber', '!=', '');
    const snapshot = await query.get();
    return snapshot.docs.map(doc => doc.data());
}

module.exports = {createDonation, addBarcode, addOutcome, getDonation, getGiftAid}