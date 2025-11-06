const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY || 're_5HkXkKng_9En8iRUJvep7uASM2odyKQBS');

async function testEmail() {
  console.log('\n=== Testing Resend Email Service ===\n');

  try {
    const { data, error } = await resend.emails.send({
      from: 'Duely <onboarding@resend.dev>',
      to: ['stevenoklizz@gmail.com'], // Your registered Resend email
      subject: 'Test Email from Duely - Password Reset',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Test Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f0fdfa;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px;">
            <h1 style="color: #14b8a6;">🎉 Email Test Successful!</h1>
            <p>Your Resend integration is working perfectly!</p>

            <div style="background: #f0fdfa; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <h2 style="color: #0d9488; margin-top: 0;">Test Details:</h2>
              <ul style="color: #374151;">
                <li><strong>Service:</strong> Resend</li>
                <li><strong>From:</strong> Duely &lt;onboarding@resend.dev&gt;</li>
                <li><strong>To:</strong> stevenoklizz@gmail.com</li>
                <li><strong>Status:</strong> ✅ Successfully sent</li>
              </ul>
            </div>

            <p style="color: #6b7280;">
              Your forgot password feature will now send emails automatically when users request password resets.
            </p>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                This is a test email from <strong style="color: #14b8a6;">Duely</strong> subscription management app
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Failed to send email:');
      console.error('Error:', error);
      return;
    }

    console.log('✅ Email sent successfully!');
    console.log('\nEmail Details:');
    console.log('  - Email ID:', data.id);
    console.log('  - From: Duely <onboarding@resend.dev>');
    console.log('  - To: stevenoklizz@gmail.com');
    console.log('  - Subject: Test Email from Duely');

    console.log('\n📧 Check your inbox at stevenoklizz@gmail.com');
    console.log('   (Also check spam/junk folder if not in inbox)\n');

    console.log('=== Test Complete ===\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmail();
