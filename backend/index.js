const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const mongoose = require('mongoose')

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb+srv://Naveen:12345@cluster0.fam72nc.mongodb.net/passkey?retryWrites=true&w=majority&appName=Cluster0").then(function () {
    console.log("connected to DB")
}).catch(function () {
    console.log("Failed to connect")
})

const credential = mongoose.model("credential", {}, "bulkmail")

credential.find().then(function (data) {
    console.log(data[0].toJSON())

        const creds = data[0].toJSON(); // ✅ Convert document to plain object

    console.log("Loaded credentials from DB:", creds);

   transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: creds.user,
        pass: creds.pass, // App password
      },
    });

    // ✅ Start server only after transporter is ready
    app.listen(5000, () => {
      console.log("Server started on port 5000...");
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });

// ✅ Email route — only runs if transporter is ready
app.post("/sendmail", async (req, res) => {
  if (!transporter) {
    return res.status(503).send("Server not ready. Please try again later.");
  }

  const { msg, emailList } = req.body;

  if (!msg || !Array.isArray(emailList)) {
    return res.status(400).send("Invalid input");
  }

  const sendPromises = emailList.map((email) => {
    const mailOptions = {
      from: "Bulk Mail App <noreply@example.com>",
      to: email,
      subject: "A message from Bulk Mail App",
      text: msg,
    };
    return transporter.sendMail(mailOptions);
  });

  try {
    await Promise.all(sendPromises);
    res.send(true);
  } catch (err) {
    console.error("Error while sending emails:", err);
    res.send(false);
  }
});