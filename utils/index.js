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
const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: true,
  logger: true,
  debug: true,
  auth: {
    user: process.env.FROM_EMAIL,
    pass: process.env.FROM_EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: true
  }
});
  module.exports = {
    convertPhoneToISO,
    generateAccountNumber,
    transporter
  }