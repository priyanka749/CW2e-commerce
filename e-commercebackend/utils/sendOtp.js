const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "priyankabhandari749@gmail.com", // ✅ fixed email
    pass: "zrjfmqocfqjzbusy",              // ✅ app password (no spaces)
  },
});

const sendOtp = async (toEmail, otp) => {
  const mailOptions = {
    from: `"Anka Attire" <priyankabhandari749@gmail.com>`, // ✅ must match auth.user
    to: toEmail,
    subject: "Your OTP for Anka Attire",
    html: `<p>Your OTP is: <b>${otp}</b></p>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendOtp;
