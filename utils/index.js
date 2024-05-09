const dotenv = require('dotenv');
dotenv.config();
const nodemailer = require('nodemailer');

const convertPhoneToISO = (number, countryCode = "234") => {
    if (!number) return "";
    if (number.substring(0, 4) === `+${countryCode}`) {
      return number;
    } else if (number.substring(0, 3) === countryCode) {
      return `+${number}`;
    } else if (number.charAt(0) === "0") {
      return `+${countryCode}${number.slice(1)}`;
    } else {
      return null;
    }
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