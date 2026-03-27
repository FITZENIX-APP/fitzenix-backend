import { Resend } from 'resend'
import config from '../config'

const resend = config.email.resendApiKey
  ? new Resend(config.email.resendApiKey)
  : null

export async function sendVerificationOtpEmail(input: {
  to: string
  otp: string
}): Promise<void> {
  const subject = 'Verify your FITZENIX account'
  
  const html = `
 
<div style="margin:0; padding:0; background-color:#0a0a0f; font-family:'DM Sans', sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="min-height:100vh; padding:40px 16px;">
    <tr>
      <td align="center" valign="middle">

        <!-- Outer glow wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <tr>
            <td style="
              background: linear-gradient(145deg, #1a1a2e 0%, #12121f 60%, #0e0e1a 100%);
              border-radius: 24px;
              padding: 2px;
              box-shadow:
                0 0 0 1px rgba(99,102,241,0.15),
                0 0 60px rgba(99,102,241,0.08),
                0 40px 80px rgba(0,0,0,0.6);
            ">
              <table width="100%" cellpadding="0" cellspacing="0" style="
                background: linear-gradient(160deg, #13131f 0%, #0f0f1c 100%);
                border-radius: 22px;
                overflow: hidden;
              ">

                <!-- Top accent bar -->
                <tr>
                  <td style="
                    height: 3px;
                    background: linear-gradient(90deg, #6366f1 0%, #a78bfa 40%, #ec4899 80%, transparent 100%);
                    border-radius: 22px 22px 0 0;
                  "></td>
                </tr>

                <!-- Header section with logo -->
                <tr>
                  <td align="center">
                    <!-- Logo badge -->
                    <div>
                      <img src="https://res.cloudinary.com/do9i5ypbl/image/upload/v1774640038/1774203065148-removebg-preview_qd2wrc.png"
                           alt="Gym App"
                           width="400"
                           height="200"
                           style="display:block; filter: drop-shadow(0 0 16px rgba(99,102,241,0.6)) brightness(1.1);" />
                    </div>
                  </td>
                </tr>

                <!-- Heading -->
                <tr>
                  <td align="center">
                    <h1 style="
                      margin: 0;
                      font-family: 'Syne', sans-serif;
                      font-size: 30px;
                      font-weight: 800;
                      letter-spacing: -0.5px;
                      color: #ffffff;
                    ">Verify Your Identity</h1>
                  </td>
                </tr>

                <!-- Subtitle -->
                <tr>
                  <td align="center" style="padding: 10px 40px 0;">
                    <p style="
                      margin: 0;
                      font-size: 14px;
                      color: #6b7280;
                      font-weight: 400;
                      line-height: 1.6;
                    ">
                      Enter this one-time passcode to<br/>complete your secure verification
                    </p>
                  </td>
                </tr>

                <!-- OTP Block -->
                <tr>
                  <td align="center" style="padding: 36px 40px 28px;">

                    <!-- Label -->
                    <p style="
                      margin: 0 0 14px;
                      font-size: 10px;
                      font-weight: 600;
                      letter-spacing: 3px;
                      text-transform: uppercase;
                      color: #6366f1;
                    ">YOUR ONE-TIME CODE</p>

                    <!-- OTP Digits container -->
                    <table cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td style="
                          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(167,139,250,0.06));
                          border: 1px solid rgba(99,102,241,0.25);
                          border-radius: 16px;
                          padding: 20px 36px;
                          box-shadow:
                            0 0 30px rgba(99,102,241,0.12),
                            inset 0 1px 0 rgba(255,255,255,0.05);
                        ">
                          <span style="
                            font-family: 'Syne', monospace;
                            font-size: 40px;
                            font-weight: 800;
                            letter-spacing: 14px;
                            color: #ffffff;
                            text-shadow: 0 0 20px rgba(167,139,250,0.4);
                            display: block;
                            padding-right: -14px;
                          ">${input.otp}</span>
                        </td>
                      </tr>
                    </table>

                    <!-- Timer -->
                    <table cellpadding="0" cellspacing="0" align="center" style="margin-top: 16px;">
                      <tr>
                        <td style="
                          background: rgba(239,68,68,0.08);
                          border: 1px solid rgba(239,68,68,0.2);
                          border-radius: 20px;
                          padding: 6px 14px;
                        ">
                          <p style="
                            margin: 0;
                            font-size: 11px;
                            color: #f87171;
                            font-weight: 500;
                            letter-spacing: 0.5px;
                          ">⏱ Expires in 10 minutes</p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Divider -->
                <tr>
                  <td style="padding: 0 40px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent);"></div>
                  </td>
                </tr>

                <!-- Security notice -->
                <tr>
                  <td align="center" style="padding: 24px 40px 36px;">
                    <table cellpadding="0" cellspacing="0" align="center">
                      <tr>
                        <td valign="top" style="padding-right: 10px; font-size: 16px;">🔒</td>
                        <td>
                          <p style="
                            margin: 0;
                            font-size: 12px;
                            color: #4b5563;
                            line-height: 1.7;
                            text-align: left;
                          ">
                            <span style="color: #6b7280;">Didn't request this?</span><br/>
                            You can safely ignore this email. Your account remains secure.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>

        <!-- Footer -->
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; margin-top: 20px;">
          <tr>
            <td align="center">
              <p style="margin:0; font-size:12px; color:#6b7280; letter-spacing: 0.5px;">
                © ${new Date().getFullYear()} <span style="color:#a78bfa; font-weight:600;">FITZENIX</span> · All rights reserved
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</div>
`

  if (!resend || config.email.provider === 'mock') {
    console.log(`[Email mock] to=${input.to} otp=${input.otp}`)
    return
  }

  console.log("registered mail",config.email.from);
  console.log("registed login",input.to);
  
  
  await resend.emails.send({
    from: config.email.from,
    to: input.to,
    subject,
    html,
  })
}
