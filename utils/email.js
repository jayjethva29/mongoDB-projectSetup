const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");

/**
 * @param {String} options.from Ex. XYZ <test@gmail.com>
 * @param {String} options.to
 * @param {String} options.subject
 * @param {String} options.message
 */
exports.sendEmail = async function (options) {
  // 1) Create transporter
  const transporter = nodemailer.createTransport(
    sendGridTransport({
      auth: {
        api_key: process.env.SENDGRID_KEY,
      },
    })
  );

  // 2) Define options for email
  const mailOptions = {
    from: options.from,
    to: options.to,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) Send the email
  await transporter.sendMail(mailOptions);
};
