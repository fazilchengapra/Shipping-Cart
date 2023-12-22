const nodemailer = require('nodemailer');
const collection = require('./collection')

module.exports.mail = (data) => {
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
        to: data, // Recipient's email address
        subject: 'Just Test',
        html:`
        <html>
          <body>
            <h1>Hello from Node.js!</h1>
            <p>This is a test email with <strong>HTML content</strong>.</p>
          </body>
        </html>
      `
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) { 
            return console.error('Error:', error);
        }
        console.log('Email sent:', info.response); 
    });
}
