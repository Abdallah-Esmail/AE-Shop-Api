import nodemailer from "nodemailer";
import config from "../config/config.js";

const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const transporter = nodemailer.createTransport({
    host: config.EMAIL_HOST,
    port: config.EMAIL_PORT,
    secure: false,
    auth: {
      user: config.EMAIL_USER,
      pass: config.EMAIL_PASS,
    },
  });

  const mailOpts = {
    from: `E-shop App <${config.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOpts);
};

export default sendEmail;
