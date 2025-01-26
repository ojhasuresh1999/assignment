import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",
  port: 2525,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ name, email }) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "Email Verification....",
    text: `Hello ${name}, Please verify your email address by clicking on the link below ${process.env.BASE_URL}/user/verify-email?email=${email}`,
  });
  console.log("Email sent successfully");
};

export default sendEmail;
