const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const link = `${process.env.BASE_URL}/verify-email/${token}`;
  await transporter.sendMail({
    from: `"Smart Vendor" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your email',
    html: `<p>Click the link to verify your email:</p><a href="${link}">${link}</a>`,
  });
};
const sendResetPasswordEmail = async (email, token) => {
  const link = `${process.env.BASE_URL}/reset-password/${token}`;
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Reset Your Password',
    html: `<p>Click <a href="${link}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  });
};
const sendBudgetAlertEmail = async ({ userEmail, category, spentAmount, budgetAmount }) => {
  const percentage = Math.round((spentAmount / budgetAmount) * 100);

  const mailOptions = {
    from: `"Smart Vendor" <${process.env.SMTP_USER}>`,
    to: userEmail,
    subject: `Budget Alert: You've spent ${percentage}% of your '${category}' budget`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
        <h2 style="color: #d9534f;">Budget Alert</h2>
        <p>Hi there,</p>
        <p>This is an alert to let you know that you have spent <strong>₹${spentAmount.toLocaleString('en-IN')}</strong> of your <strong>₹${budgetAmount.toLocaleString('en-IN')}</strong> budget for the <strong>"${category}"</strong> category.</p>
        <p>You have now used <strong>${percentage}%</strong> of your budget for this period.</p>
        <p>You might want to review your recent spending to stay on track.</p>
        <br/>
        <p>Thanks,</p>
        <p><strong>The Smart Vendor Team</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
module.exports = { sendVerificationEmail ,sendResetPasswordEmail,sendBudgetAlertEmail };
