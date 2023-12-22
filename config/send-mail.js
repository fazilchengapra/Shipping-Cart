const nodemailer = require('nodemailer');
const collection = require('./collection');
const { promises } = require('fs');
const { resolve } = require('path');
const { reject } = require('promise');

module.exports.mail = (data) => {
  return new Promise((resolve, reject) => {
    // Create a transporter object
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: collection.MAIL_ADDRESS, // Your email address
        pass: collection.MAIL_PASS // Your email password (use an app password for security)
      }
    });

    // Email content
    const mailOptions = {
      from: collection.MAIL_ADDRESS, // Sender's email address
      to: data.email, // Recipient's email address
      subject: 'Dont Share',
      text: 'Your one time password is '+data.otp
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error:', error);
        reject(error); // Reject the promise with the error
      } else {
        resolve(info.response); // Resolve the promise with the response
      }
    });
  });
};
