const {sendEmail} = require('./email')

const testAddress = "matthew.garrad@ada.ac.uk"

describe('Testing firebase', () => {
    test('Create a donation and read data', async () => {
        const emailResult = await sendEmail(testAddress, 'Test Email', 'This is a test email.\nIt was run by email.test.js')
        // Manually verify that the email was received
        expect(emailResult).toBeTruthy();
    })
})