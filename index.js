if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");
const serviceAccount = require("./serviceAccount.json");
const cors = require("cors");
const User = require("./models/user");
const Dates = require("./models/dates");
const { protect } = require("./middleware");
const nodemailer = require("nodemailer");

console.log(serviceAccount);

const app = express();
app.use(express.urlencoded({ extended: true }));

const dbUrl = process.env.DB_URL;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`Database Connected`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

app.set("views", path.join(__dirname, "views"));

app.use(express.json());
app.use(cors());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

const secret = process.env.SECRET;

const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
  collection: "session",
});

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

const pass = process.env.PASS;

const authmail = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "mageshmurugan64@gmail.com",
    pass: pass,
  },
});

app.get("/", (req, res) => {
  res.send("success");
});

app.post("/", protect, async (req, res) => {
  try {
    const { names, email, date, nam } = req.body;
    const m = date.split("-");
    const sp = m[0];
    const n = m.slice(1);
    const tit = n.join("-");
    // const ips = req.headers['x-forwarded-for'];
    const ips = req.socket.remoteAddress;
    const data = new Dates({
      email: email,
      names: names,
      date: tit,
      year: sp,
      nam: nam,
      ip: ips,
    });
    await data.save();
    console.log(data);
    return res.status(200).json({ message: "Automated Email Successfully" });
  } catch {
    res.status(400).json({ message: "Email automation failed" });
  }
});

app.get("/email", async (req, res) => {
  const date = new Date();
  const formatters = new Intl.DateTimeFormat("sv", {
    dateStyle: "short",
    timeZone: "Asia/Kolkata",
  });
  const hell = formatters.format(date).split("-").slice(1).join("-");

  const findDate = await Dates.find({
    date: hell,
  });
  if (findDate) {
    for (let datq of findDate) {
      // console.log(datq.nam)

      const sendName = datq.email.split("@");
      // console.log(sendName[0])
      const mailOptions = {
        from: `${datq.nam} <mageshmurugan64@gmail.com>`,
        to: `${sendName[0]} <${datq.email}>`,
        subject: `Happie Birthday ${datq.names}`,
        // text: `Wishing You the Best Birthday ${datq.names} `

        html: `<!DOCTYPE HTML
              PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
          <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
              xmlns:o="urn:schemas-microsoft-com:office:office">

          <head>
              <!--[if gte mso 9]>
                            <xml>
                              <o:OfficeDocumentSettings>
                                <o:AllowPNG/>
                                <o:PixelsPerInch>96</o:PixelsPerInch>
                              </o:OfficeDocumentSettings>
                            </xml>
                            <![endif]-->
              <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta name="x-apple-disable-message-reformatting">
              <!--[if !mso]><!-->
              <meta http-equiv="X-UA-Compatible" content="IE=edge">
              <!--<![endif]-->
              <title></title>

              <style type="text/css">
                  @media only screen and (min-width: 620px) {
                      .u-row {
                          width: 600px !important;
                      }

                      .u-row .u-col {
                          vertical-align: top;
                      }

                      .u-row .u-col-100 {
                          width: 600px !important;
                      }

                  }

                  @media (max-width: 620px) {
                      .u-row-container {
                          max-width: 100% !important;
                          padding-left: 0px !important;
                          padding-right: 0px !important;
                      }

                      .u-row .u-col {
                          min-width: 320px !important;
                          max-width: 100% !important;
                          display: block !important;
                      }

                      .u-row {
                          width: calc(100% - 40px) !important;
                      }

                      .u-col {
                          width: 100% !important;
                      }

                      .u-col>div {
                          margin: 0 auto;
                      }
                  }

                  body {
                      margin: 0;
                      padding: 0;
                  }

                  table,
                  tr,
                  td {
                      vertical-align: top;
                      border-collapse: collapse;
                  }

                  p {
                      margin: 0;
                  }

                  .ie-container table,
                  .mso-container table {
                      table-layout: fixed;
                  }

                  * {
                      line-height: inherit;
                  }

                  a[x-apple-data-detectors='true'] {
                      color: inherit !important;
                      text-decoration: none !important;
                  }

                  table,
                  td {
                      color: #000000;
                  }

                  #u_body a {
                      color: #0000ee;
                      text-decoration: underline;
                  }
              </style>



              <!--[if !mso]><!-->
              <link href="https://fonts.googleapis.com/css?family=Raleway:400,700&display=swap" rel="stylesheet" type="text/css">
              <!--<![endif]-->


          </head>

          <body class="clean-body u_body"
              style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
              <!--[if IE]><div class="ie-container"><![endif]-->
              <!--[if mso]><div class="mso-container"><![endif]-->
              <table id="u_body"
                  style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
                  cellpadding="0" cellspacing="0">
                  <tbody>
                      <tr style="vertical-align: top">
                          <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
                              <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->


                              <div class="u-row-container" style="padding: 0px 10px;background-color: rgba(255,255,255,0)">
                                  <div class="u-row"
                                      style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #b5e0ff;">
                                      <div
                                          style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px 10px;background-color: rgba(255,255,255,0);" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: #b5e0ff;"><![endif]-->

                                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                          <div class="u-col u-col-100"
                                              style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                              <div style="height: 100%;width: 100% !important;">
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                  <div
                                                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                      <!--<![endif]-->

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <table width="100%" cellpadding="0" cellspacing="0"
                                                                          border="0">
                                                                          <tr>
                                                                              <!-- <td style="padding-right: 0px;padding-left: 0px;" align="center">
                                                                Happie Birthday
                                                                <img align="center" border="0" src="images/image-1.png" alt="Image" title="Image"
                                                                  style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 227px;"
                                                                  width="227" />

                                                        </td> -->
                                                                          </tr>
                                                                      </table>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:16px 20px 8px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #ffffff; line-height: 120%; text-align: center; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 120%;">
                                                                              <strong><span
                                                                                      style="font-size: 38px; line-height: 57.6px; font-family: Raleway, sans-serif;">Happy
                                                                                      Birthday ${datq.names}</span></strong>
                                                                          </p>
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:22px 0px 0px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <table width="100%" cellpadding="0" cellspacing="0"
                                                                          border="0">
                                                                          <tr>
                                                                              <td style="padding-right: 0px;padding-left: 0px;"
                                                                                  align="center">

                                                                                  <img align="center" border="0"
                                                                                      src="https://res.cloudinary.com/magesh/image/upload/v1660987938/image-2_oy2l4b.png"
                                                                                      alt="Image" title="Image"
                                                                                      style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 100%;max-width: 564px;"
                                                                                      width="564" />

                                                                              </td>
                                                                          </tr>
                                                                      </table>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 20px 14px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #ffffff; line-height: 120%; text-align: center; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 120%;"><span
                                                                                  style="font-size: 28px; line-height: 36px;">Hope
                                                                                  all your birthday wishes come
                                                                                  true!</span></p>
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 20px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #ffffff; line-height: 130%; text-align: center; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 130%;"><span
                                                                                  style="font-size: 16px; line-height: 20.8px;">This
                                                                                  is a Automated Email,</span></p>
                                                                          <p style="font-size: 14px; line-height: 130%;"><span
                                                                                  style="font-size: 16px; line-height: 20.8px;">Created
                                                                                  By ${datq.nam}.</span></p>
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 20px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #e34c1e; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 140%;"><span
                                                                                  style="font-size: 18px; line-height: 25.2px;">To
                                                                                  Automate a Birthday wishes for your
                                                                                  friends,</span></p>
                                                                          <p style="font-size: 14px; line-height: 140%;"><span
                                                                                  style="font-size: 18px; line-height: 25.2px;">Click
                                                                                  the link below.</span></p>
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 20px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
                                                                          <!-- <p style="font-size: 14px; line-height: 140%;"><span
                                                                style="font-size: 16px; line-height: 22.4px;">That&rsquo;s right! It&rsquo;s not
                                                                just your birthday,</span></p> -->

                                                                          <!-- <p style="font-size: 14px; line-height: 140%;"><span
                                                                style="font-size: 16px; line-height: 22.4px;">but
                                                                we&rsquo;re celebrating you for a
                                                                whole month!</span></p> -->
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 17px 23px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div align="center"
                                                                          style="-webkit-tap-highlight-color: transparent;">
                                                                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;font-family:'Raleway',sans-serif;"><tr><td style="font-family:'Raleway',sans-serif;" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:54px; v-text-anchor:middle; width:300px;" arcsize="18.5%" strokecolor="#ffffff" strokeweight="2px" fillcolor="#e34c1e"><w:anchorlock/><center style="color:#FFF;font-family:'Raleway',sans-serif;"><![endif]-->
                                                                          <a href="https://happiebirthday.vercel.app/"
                                                                              target="_blank"
                                                                              style="box-sizing: border-box; -webkit-tap-highlight-color: transparent; display: inline-block;font-family:'Raleway',sans-serif;text-decoration: none;-webkit-text-size-adjust: none;text-align: center;color: #FFF; background-color: #e34c1e; border-radius: 10px;-webkit-border-radius: 10px; -moz-border-radius: 10px; width:auto; max-width:100%; overflow-wrap: break-word; word-break: break-word; word-wrap:break-word; mso-border-alt: none;border-top-color: #ffffff; border-top-style: solid; border-top-width: 2px; border-left-color: #ffffff; border-left-style: solid; border-left-width: 2px; border-right-color: #ffffff; border-right-style: solid; border-right-width: 2px; border-bottom-color: #ffffff; border-bottom-style: solid; border-bottom-width: 2px;">
                                                                              <span
                                                                                  style="display:block;padding:10px 14px;line-height:120%;"><span
                                                                                      style="font-size: 20px; line-height: 28.8px; -webkit-tap-highlight-color: transparent;">Automate
                                                                                      Birthday
                                                                                      Wishes</span></span>
                                                                          </a>
                                                                          <!--[if mso]></center></v:roundrect></td></tr></table><![endif]-->
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <!--[if (!mso)&(!IE)]><!-->
                                                  </div>
                                                  <!--<![endif]-->
                                              </div>
                                          </div>
                                          <!--[if (mso)|(IE)]></td><![endif]-->
                                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                      </div>
                                  </div>
                              </div>



                              <div class="u-row-container" style="padding: 0px 10px;background-color: rgba(255,255,255,0)">
                                  <div class="u-row"
                                      style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                      <div
                                          style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">
                                          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px 10px;background-color: rgba(255,255,255,0);" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:600px;"><tr style="background-color: transparent;"><![endif]-->

                                          <!--[if (mso)|(IE)]><td align="center" width="600" style="width: 600px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
                                          <div class="u-col u-col-100"
                                              style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                              <div style="height: 100%;width: 100% !important;">
                                                  <!--[if (!mso)&(!IE)]><!-->
                                                  <div
                                                      style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
                                                      <!--<![endif]-->

                                                      <table style="font-family:'Raleway',sans-serif;" role="presentation"
                                                          cellpadding="0" cellspacing="0" width="100%" border="0">
                                                          <tbody>
                                                              <tr>
                                                                  <td style="overflow-wrap:break-word;word-break:break-word;padding:15px 20px 20px;font-family:'Raleway',sans-serif;"
                                                                      align="left">

                                                                      <div
                                                                          style="color: #9c9c9c; -webkit-tap-highlight-color: transparent; line-height: 160%; text-align: center; word-wrap: break-word;">
                                                                          <p style="font-size: 14px; line-height: 160%;">We hope
                                                                              you have the happiest of
                                                                              birthdays!</p>
                                                                          <p style="font-size: 14px; line-height: 160%;">&nbsp;
                                                                          </p>
                                                                          <!-- <p style="line-height: 160%; font-size: 14px;">Developed
                                                                                          By Magesh Murugan,</p> -->

                                                                          <a href="mailto:mageshmurugant@gmail.com"
                                                                              target="_blank"
                                                                              style="-webkit-tap-highlight-color: transparent;"><img
                                                                                  style="width: 38px; -webkit-tap-highlight-color: transparent;"
                                                                                  src="https://download.logo.wine/logo/Gmail/Gmail-Logo.wine.png"
                                                                                  alt="" srcset=""></a>
                                                                          <a href="https://twitter.com/_Magesh_M" target="_blank"
                                                                              style="padding-left: 7px; -webkit-tap-highlight-color: transparent; "><img
                                                                                  style="width: 25px; -webkit-tap-highlight-color: transparent;"
                                                                                  src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Twitter_Logo.png"
                                                                                  alt="" srcset=""></a>
                                                                          <a href="https://www.instagram.com/magesh__m/?hl=en "
                                                                              target="_blank"
                                                                              style=" padding-left: 11px; -webkit-tap-highlight-color: transparent;"><img
                                                                                  style="width: 23px; height: 23px; -webkit-tap-highlight-color: transparent;"
                                                                                  src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png"
                                                                                  alt="" srcset=""></a>
                                                                          <a href="tel:+919345480054" target="_blank"
                                                                              style=" padding-left: 11px; -webkit-tap-highlight-color: transparent;"><img
                                                                                  style="width: 25px; -webkit-tap-highlight-color: transparent;"
                                                                                  src="https://www.seekpng.com/png/full/773-7730911_iphone-telephone-logo-computer-icons-clip-art-red.png"
                                                                                  alt="" srcset=""></a>
                                                                          <!-- <p style="line-height: 160%; font-size: 14px;">Happie
                                                                                          Birthday</p> -->
                                                                          <p style="margin-bottom:7px">Developed by Magesh Murugan
                                                                          </p>
                                                                      </div>

                                                                  </td>
                                                              </tr>
                                                          </tbody>
                                                      </table>

                                                      <!--[if (!mso)&(!IE)]><!-->
                                                  </div>
                                                  <!--<![endif]-->
                                              </div>
                                          </div>
                                          <!--[if (mso)|(IE)]></td><![endif]-->
                                          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
                                      </div>
                                  </div>
                              </div>



                              <!-- <div class="u-row-container" style="padding: 30px;background-color: #f0f0f0">
                                        <div class="u-row"
                                          style="Margin: 0 auto;min-width: 320px;max-width: 600px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
                                          <div
                                            style="border-collapse: collapse;display: table;width: 100%;height: 100%;background-color: transparent;">

                                            <div class="u-col u-col-100"
                                              style="max-width: 320px;min-width: 600px;display: table-cell;vertical-align: top;">
                                              <div style="height: 100%;width: 100% !important;">
                                                <div
                                                  style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">

                                                  <table style="font-family:'Raleway',sans-serif;" role="presentation" cellpadding="0"
                                                    cellspacing="0" width="100%" border="0">
                                                    <tbody>
                                                      <tr>
                                                        <td
                                                          style="overflow-wrap:break-word;word-break:break-word;padding:20px;font-family:'Raleway',sans-serif;"
                                                          align="left">

                                                          <div style="line-height: 120%; text-align: left; word-wrap: break-word;">
                                                            <div style="font-family: arial, helvetica, sans-serif;"><span
                                                                style="font-size: 12px; color: #999999; line-height: 14.4px;">You received this
                                                                email because you signed up for My Company Inc.</span></div>
                                                            <div style="font-family: arial, helvetica, sans-serif;">&nbsp;</div>
                                                            <div style="font-family: arial, helvetica, sans-serif;"><span
                                                                style="font-size: 12px; color: #999999; line-height: 14.4px;">Unsubscribe</span>
                                                            </div>
                                                          </div>

                                                        </td>
                                                      </tr>
                                                    </tbody>
                                                  </table>

                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div> -->


                              <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                          </td>
                      </tr>
                  </tbody>
              </table>
              <!--[if mso]></div><![endif]-->
              <!--[if IE]></div><![endif]-->

          </body>

          </html>`,
      };

      await authmail.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("ERROR");
          console.log(error);
        } else {
          console.log("Email Sent :" + info.response);
        }
      });
    }
    res.status(200).json({ message: "sended something" });
  }
  res.status(200).json({ message: "Nothing sended" });
});

app.post("/firebase", async (req, res) => {
  const { phoneNumber } = req.body.user;
  const { accessToken } = req.body.user.stsTokenManager;

  admin
    .auth()
    .verifyIdToken(accessToken)
    .then(async (decodedToken) => {
      console.log(decodedToken);
      if (decodedToken.phone_number == phoneNumber) {
        const existNo = await User.findOne({
          phone: decodedToken.phone_number,
        });
        console.log(`exist......${existNo}`);
        if (existNo) {
          const jwtAccess = jwt.sign(
            { mobile: existNo.phone },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "20d" }
          );
          const mobile = existNo.phone;
          res.status(200).json({ jwtAccess, mobile });
        } else {
          const users = new User({
            phone: decodedToken.phone_number,
          });
          await users.save();

          const jwtAccess = jwt.sign(
            { mobile: users.phone },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "20d" }
          );
          const mobile = users.phone;

          res.status(200).json({ jwtAccess, mobile });
        }
      }
    })
    .catch((error) => {
      console.error("Error verifying access token:", error);
      res.status(400).json({ message: "Token verification failed" });
    });
});

const port = process.env.PORT;

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
  });
});
