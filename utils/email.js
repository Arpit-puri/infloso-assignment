const nodemaile = require("nodemailer");

const sendEmail = async (option) => {
  //creating a transporter using mailtrap
  const transporter =await nodemaile.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.PORT,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASSWORD },
  });

  //defining email options
  const emailoptions = {
    from: "infloso support<support@infloso.com>",
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(emailoptions);
};

module.exports = sendEmail;
