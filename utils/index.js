const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');

const convertPhoneToISO = (number, countryCode = "234") => {
  if (!number) return "";
  const cleaned = number.replace(/[^0-9+]/g, "");
  const normalized = cleaned.replace(/^\++/, "+");
  if (normalized.startsWith(`+${countryCode}`)) {
    return normalized;
  }
  if (normalized.startsWith(countryCode)) {
    return `+${normalized}`;
  }
  if (normalized.startsWith("0")) {
    return `+${countryCode}${normalized.slice(1)}`;
  }
  if (/^\d+$/.test(normalized)) {
    return `+${countryCode}${normalized}`;
  }
  return null;
};


  function generateAccountNumber() {
    let accountNumber = '';
    const digits = '0123456789';

    for (let i = 0; i < 10; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        accountNumber += digits[randomIndex];
    }

    return accountNumber;
}

function generateEmailVerificationCode(length = 6) {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
}

// async function transporter(user, emailVerificationCode) {
//   try {
//     const mailtransporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER, 
//         pass: process.env.EMAIL_PASS, 
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     await mailtransporter.sendMail({
//       from: `"Banko" <${process.env.EMAIL_USER}>`,
//       to: user.email,
//       subject: "Your Verification Code",
//       text: `Your verification code is ${emailVerificationCode}. It will expire in 10 minutes.`,
//     });

//     console.log("Email sent successfully");
//   } catch (error) {
//     console.error("Error:", error);
//   }
// }

  module.exports = {
    convertPhoneToISO,
    generateAccountNumber,
    generateEmailVerificationCode,
  }