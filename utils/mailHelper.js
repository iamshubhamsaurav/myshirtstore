const nodemailer = require('nodemailer')

const mailHelper = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "4b7361cbcdb99b",
          pass: "b25c37c61c49f7"
        }
      });

      const message = {
        from: '"Admin" <admin@example.com>', // sender address
        to: options.email, // list of receivers
        subject: options.subject, // Subject line
        text: options.message,  // plain text
      }
    
      // send mail with defined transport object
      await transporter.sendMail(message);
}

module.exports = mailHelper