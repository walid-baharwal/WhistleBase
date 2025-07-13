import { sendVerificationEmail } from '../helpers/sendVerificationEmail';

// Simple test function to verify email sending
async function testEmailSending() {
  console.log('Testing email sending functionality...');
  
  try {
    const result = await sendVerificationEmail(
      'test@example.com', // Replace with your test email
      'Test User',
      '123456'
    );
    
    console.log('Email test result:', result);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

// Uncomment the line below to run the test
// testEmailSending();

export { testEmailSending };
