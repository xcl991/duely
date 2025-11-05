import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendPasswordResetEmailParams {
  to: string;
  resetLink: string;
  userName?: string;
}

export async function sendPasswordResetEmail({
  to,
  resetLink,
  userName,
}: SendPasswordResetEmailParams) {
  try {
    // Check if RESEND_API_KEY is configured
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  RESEND_API_KEY not configured. Email not sent.');
      console.log('Reset link (for development):', resetLink);
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Duely <onboarding@resend.dev>',
      to: [to],
      subject: 'Reset Your Password - Duely',
      html: getPasswordResetEmailTemplate(resetLink, userName || 'there'),
    });

    if (error) {
      console.error('Failed to send email:', error);

      // If error is 403 (testing mode restriction), it's expected
      // Log the reset link to console for development
      if (error.message && error.message.includes('testing emails')) {
        console.log('\n⚠️  Resend Testing Mode: Email can only be sent to registered email');
        console.log(`📧 Reset link for development: ${resetLink}\n`);
      }

      return { success: false, error: error.message };
    }

    console.log('✓ Password reset email sent to:', to);
    return { success: true, data };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Email template for password reset
function getPasswordResetEmailTemplate(resetLink: string, userName: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f0fdfa;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Reset Your Password</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 16px 0; color: #374151; font-size: 16px; line-height: 24px;">
                Hi ${userName},
              </p>

              <p style="margin: 0 0 24px 0; color: #374151; font-size: 16px; line-height: 24px;">
                We received a request to reset your password for your Duely account. Click the button below to create a new password:
              </p>

              <!-- Button -->
              <table role="presentation" style="margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${resetLink}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 16px 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                Or copy and paste this link into your browser:
              </p>

              <p style="margin: 0 0 24px 0; padding: 12px; background-color: #f3f4f6; border-radius: 4px; color: #14b8a6; font-size: 14px; word-break: break-all;">
                ${resetLink}
              </p>

              <p style="margin: 24px 0 16px 0; color: #374151; font-size: 16px; line-height: 24px;">
                <strong>This link will expire in 1 hour</strong> for security reasons.
              </p>

              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; line-height: 20px;">
                If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 8px 0; color: #9ca3af; font-size: 14px;">
                This email was sent by <strong style="color: #14b8a6;">Duely</strong>
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Subscription tracking and management made easy
              </p>
            </td>
          </tr>
        </table>

        <!-- Security Notice -->
        <table role="presentation" style="width: 600px; margin-top: 16px;">
          <tr>
            <td style="text-align: center; padding: 16px;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 18px;">
                For security reasons, never share this email or link with anyone.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
