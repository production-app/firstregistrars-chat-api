const sgMail = require("@sendgrid/mail");
const { JsonDB } = require("node-json-db");
const request = require("request");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");
const moment = require("moment");
const { google } = require("googleapis");
const cryto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const nodeoutlook = require("nodejs-nodemailer-outlook");
const nodemailer = require("nodemailer");
const db = new JsonDB(new Config("myDataBase", true, false, "/"));
const {
  api_shareholderinfo_company,
  otpLogs,
  ebanco_api_unclameddivdend,
  T_shold,
  TgetStocks,
  api_Tcountbyphone,
  api_Tcountbyemail,
  api_TClaimedDividend,
  api_TunClaimedDividend,
} = require("../models");
const { sequelize, initModels } = require("../models");
const redis = require("redis");
const uuid = require("uuid");
// const clientRedis = redis.createClient(
//   process.env.REDIS_PORT,
//   process.env.REDIS_USERNAME
// );
const { QueryTypes } = require("sequelize");
const { json } = require("express");
const { validationResult } = require("express-validator");

//clientRedis.AUTH(process.env.REDIS_PASSWORD); //() => {
//console.log("Conected to Redis Cloud !");
//clientRedis.quit();
//});

//Initializing the 0Auth

const CLIENT_ID = process.env.CLEINT_SECRET;
const CLEINT_SECRET = process.env.CLEINT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

//Initialization of the Twilio parameters

const accountSid = process.env.ACCCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

//Token paramater initialization

const JWT_AUTH_TOKEN = process.env.JWT_AUTH_TOKEN;
const JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;

const smsKey = process.env.SMS_SECRET_KEY;

let refreshTokensID = [];

// Shareholder details
exports.createShareholderdetails = async (req, res, next) => {
  const { last_nm, first_nm, email, phone, regcode } = req.body;

  try {
    const shareholders = await Shareholder.create({
      last_nm,
      first_nm,
      email,
      phone,
      regcode,
    });

    return res.status(201).json({
      data: shareholders,
    });
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
};

// Token Users

exports.createTokenUsers = async (req, res, next) => {
  try {
    const { username, password: hashpassword } = req.body;

    const password = await bcrypt.hash(hashpassword, 10);

    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // const findUser = await tokenuser.findOne({
    //   where: { username },
    // });

    // const createUser = await tokenuser.create({
    //   username,
    //   password,
    // });

    return res.status(201).json({
      message: "User created!",
    });
  } catch (error) {
    // console.log(JSON.stringify(error.parent.code));
    // if (error.parent.code === "23505") {
    //   return res.status(500).json({
    //     message: error.parent.detail,
    //   });
    // }
  }
};

// Validate email address
exports.vertifyEmailAddress = async (req, res, next) => {
  try {
    const email = req.params.email;

    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const findEmail = await api_shareholderinfo_company
      .findOne({
        where: { mail: email },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });

    const otplogs = await otpLogs
      .findOne({
        where: {
          [Op.and]: [{ email }, { status: 1 }],
        },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });

    if (findEmail && otplogs) {
      jwt.sign(
        { scopes: ["shareholders:lookup"], email, phone: "" },
        JWT_AUTH_TOKEN,
        {
          expiresIn: "5400s",
        },
        (err, accessToken) => {
          axios.put(
            "https://firstregistrarsnigeriatoken.herokuapp.com/v1/tokens",
            //
            { value: accessToken },
            {
              auth: {
                username: "administrator@firstregistrarsnigeria.com",
                password:
                  "FeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsic2",
              },
            }
          );
          // request.put(
          //   {
          //     auth: {
          //       user: "administrator@firstregistrarsnigeria.com",
          //       pass: "FeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsic2",
          //       sendImmediately: false,
          //     },
          //   },
          //   {
          //     headers: { "content-type": "application/json" },
          //     url: "http://localhost:2000/v1/tokens",
          //     body: JSON.stringify({ value: accessToken }),

          //   },

          //   function (err, httpResponse, body) {
          //     console.log(httpResponse);
          //   }
          // );
          // .auth(
          //   "administrator@firstregistrarsnigeria.com",
          //   "FeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsic2",
          //   false
          // );
        }
      );

      return res.status(200).json({
        status: true,
        //token: data,
      });
    } else if (findEmail) {
      return res.status(200).json({
        status: true,
        message: `A shareholder with this - ${email} exists, either your OTP duration had expired or, you haven't requested an OTP. Please kindly go through the OTP validation process`,
      });
    } else {
      return res.status(404).json({
        status: false,
        msg: "Invalid email address and haven't gone through the OTP validation process",
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: `An error occurred ! - ${error}`,
    });
  }
};

// Validate Phone
exports.vertifyPhoneNumber = async (req, res, next) => {
  try {
    const mobiles = req.params.phone;

    //console.log(mobiles);

    const mobile = parseInt(mobiles, 10).toString();

    const mob = `+234 ${mobile}`;

    // Error Handling on the Users Entity

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const findPhone = await api_shareholderinfo_company
      .findOne({
        where: { mobile: mobiles },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });
    const otplogs = await otpLogs
      .findOne({
        where: {
          [Op.and]: [{ phone: mob }, { status: 1 }],
        },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });
    //console.log(otpLogs);

    if (findPhone && otplogs) {
      jwt.sign(
        { scopes: ["shareholders:lookup"], phone: mobiles, email: "" },
        JWT_AUTH_TOKEN,
        {
          expiresIn: "5400s",
        },
        (err, accessToken) => {
          axios.put(
            "https://firstregistrarsnigeriatoken.herokuapp.com/v1/tokens",
            { value: accessToken },
            {
              auth: {
                username: "administrator@firstregistrarsnigeria.com",
                password:
                  "FeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsic2",
              },
            }
          );
        }
      );

      //Calling the Token endpoints

      // let arrtoken = [];

      // const { data } = await axios.get(
      //   "https://firstregistrarstoken.herokuapp.com/v1/tokens"
      // );

      //await arrtoken.push(data);

      //console.log(a[0].data.values);

      return res.status(200).json({
        status: true,
        //  token: arrtoken[0].data.values,
      });
    } else if (findPhone) {
      return res.status(200).json({
        status: true,
        message: `A shareholder with this - 0${mobile} exists, either your OTP duration had expired or, you haven't requested an OTP. Please kindly go through the OTP validation process`,
      });
    } else {
      return res.status(404).json({
        status: false,
        msg: "Invalid phone number and haven't gone through the OTP validation process",
      });
    }
  } catch (error) {
    return res.status(404).json({
      status: false,
      message: `Pls an error occurred ! - ${error}`,
    });
  }
};

exports.sendOtpSms = async (req, res, next) => {
  try {
    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const mobiles = req.body.phone;

    const validatedPhone = mobiles; //parseInt(mobiles, 10).toString();

    const shareholder = await api_shareholderinfo_company
      .findOne({
        where: { mobile: validatedPhone },
      })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });

    if (!shareholder) {
      return res.status(404).json({
        status: false,
        message: "Phone Number doesn't exist. Kindly try with another number",
      });
    }

    const phone = `+234 ${parseInt(req.body.phone)}`;
    const otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 2 * 60 * 1000; // Time to Live 2minutes
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = cryto.createHmac("sha256", smsKey).update(data).digest("hex");
    const fullHash = `${hash}.${expires}`;

    // await client.messages
    //   .create({
    //     body: `Your OTP number is for First Registrars portal is - ${otp}`,
    //     from: +17609653189,
    //     to: phone,
    //   })
    //   .then((message) => {
    //     console.log(message);
    //   })
    //   .catch((err) => console.log(err));

    await axios
      .get(
        `http://193.105.74.59/api/sendsms/plain?user=${process.env.SMSUSERNAME}&password=${process.env.SMSPASSWORD}$&sender=FIRSTREG&SMSText=Your OTP Code is ${otp}&GSM=${phone}`
      )
      .then(() => console.log("Successful!"))
      .catch((e) => console.log(e));

    const path = `/OTPcode/${otp}`;

    db.push(path, { fullHash, phone, otp });

    return res.status(200).json({
      status: true,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.validateOtp = (req, res, next) => {
  try {
    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const otp = parseInt(req.body.otp);

    const path = `/OTPcode/${otp}`;

    // let otpPath = path.split("/")[2];

    const getOtp = db.getData(path);

    const phone = getOtp.phone;
    const hash = getOtp.fullHash;
    const email = getOtp.validatedEmail;

    let [hashValue, expires] = hash.split(".");

    let now = Date.now();

    if (now > parseInt(expires)) {
      return res.status(504).json({
        status: false,
        message: "Your OTP code had expired. Pls kindly try again",
        time: moment(now).startOf("minutes").fromNow(),
      });
    }

    const data = `${phone}.${otp}.${expires}`;

    const calculatedHash = cryto
      .createHmac("sha256", smsKey)
      .update(data)
      .digest("hex");

    if (calculatedHash === hashValue) {
      clientRedis.get("counter", (err, data) => {
        clientRedis.set("counter", parseInt(data) + 1);
        jwt.sign(
          { scopes: ["shareholders:lookup"] },
          JWT_AUTH_TOKEN,
          {
            expiresIn: "5400s",
          },
          (err, accessToken) => {
            request.put(
              {
                headers: { "content-type": "application/json" },
                url: "https://firstregistrarstoken.herokuapp.com/v1/tokens",
                body: JSON.stringify({ values: accessToken }),
              },

              function (err, httpResponse, body) {}
            );

            clientRedis.set(parseInt(data) + 1, accessToken);

            if (phone === 9033495090) {
              return otpLogs.create({
                email,
                token: accessToken,
                status: 1,
              });
            } else {
              return otpLogs.create({
                phone,
                token: accessToken,
                status: 1,
              });
            }
          }
        );

        jwt.sign(
          { data: phone },
          JWT_REFRESH_TOKEN,
          {
            expiresIn: "86400s",
          },
          (err, refreshToken) => {
            clientRedis.set(parseInt(data) + 2, refreshToken);
          }
        );

        refreshTokensID.push(parseInt(data) + 2);

        return (
          res
            .status(200)
            // .cookie("JWT_ID", parseInt(data) + 1, {
            //   maxAge: 6000000, // Note timing is in miliseconds. Approx ~ 1.7 hours of expiration
            //   httpOnly: true,
            // })
            // .cookie("JWT_REFRESH_ID", parseInt(data) + 2, {
            //   maxAge: 10000000, //Note timing is in miliseconds. Approx. ~ 69 days of expiration
            //   httpOnly: true,
            // })
            // .cookie("authSession", true, {
            //   maxAge: 6000000000, // Note timing is in miliseconds. Approx. ~ 69 days of expiration
            //   //sameSite: "strict",
            // })
            // .cookie("refreshTokenID", true, {
            //   maxAge: 6000000000,
            //   //sameSite: "strict",
            // })
            .json({
              status: true,
              message: "Device confirmed !",
            })
        );
      });
    } else {
      return res
        .status(404)
        .json({ status: false, message: "Invalid OTP Code. Pls try again" });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Invalid OTP Code. Pls try again later",
    });
  }
};

exports.sendOtpEmail = async (req, res, next) => {
  try {
    const validatedEmail = req.body.email;

    console.log(validatedEmail);

    // const shareholder = await api_shareholderinfo_company.findOne({
    //   where: { mail: validatedEmail },
    // });

    // console.log(shareholder);

    // if (!shareholder) {
    //   return res.status(404).json({
    //     status: false,
    //     message: `Email address - ${validatedEmail} doesn't exist. Kindly try again,`,
    //   });
    // }

    const phone = 9033495090; // Random number
    const otp = Math.floor(100000 + Math.random() * 900000);
    const ttl = 2 * 60 * 1000; // Time to Live 2minutes
    const expires = Date.now() + ttl;
    const data = `${phone}.${otp}.${expires}`;
    const hash = cryto.createHmac("sha256", smsKey).update(data).digest("hex");
    const fullHash = `${hash}.${expires}`;

    //Email 🛡️

    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      //secure: false, // true for 465, false for other ports
      secureConnection: false,
      auth: {
        user: "info@firstregistrarsnigeria.com", // generated ethereal user
        pass: "Investor1", // generated ethereal password
      },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    });

    //'"Fred Foo 👻" <info@firstregistrarsnigeria.com>'  info@firstregistrarsnigeria.com

    // send mail with defined transport object
    await transporter.sendMail({
      from: '"First Registrars OTP "  <info@firstregistrarsnigeria.com>', // "info@firstregistrarsnigeria.com", // sender address
      to: `${validatedEmail}`, // list of receivers
      subject: `Your FRNL OTP Code ${otp}`, // Subject line
      text: "First Registrars OTP code", // plain text body
      //replyTo: "noreply@firstregistrarsnigeria.com",
      priority: "high",
      html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html
  xmlns="http://www.w3.org/1999/xhtml"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:v="urn:schemas-microsoft-com:vml"
>
  <head>
    <!--[if gte mso 9
      ]><xml
        ><o:OfficeDocumentSettings
          ><o:AllowPNG /><o:PixelsPerInch
            >96</o:PixelsPerInch
          ></o:OfficeDocumentSettings
        ></xml
      ><!
    [endif]-->
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <meta content="width=device-width" name="viewport" />
    <!--[if !mso]><!-->
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <!--<![endif]-->
    <title></title>
    <!--[if !mso]><!-->
    <link
      href="https://fonts.googleapis.com/css?family=Abril+Fatface"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Alegreya"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Arvo"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Bitter"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Cabin"
      rel="stylesheet"
      type="text/css"
    />
    <link
      href="https://fonts.googleapis.com/css?family=Ubuntu"
      rel="stylesheet"
      type="text/css"
    />
    <!--<![endif]-->
    <style type="text/css">
      body {
        margin: 0;
        padding: 0;
      }

      table,
      td,
      tr {
        vertical-align: top;
        border-collapse: collapse;
      }

      * {
        line-height: inherit;
      }

      a[x-apple-data-detectors="true"] {
        color: inherit !important;
        text-decoration: none !important;
      }
    </style>
    <style id="media-query" type="text/css">
      @media (max-width: 520px) {
        .block-grid,
        .col {
          min-width: 320px !important;
          max-width: 100% !important;
          display: block !important;
        }

        .block-grid {
          width: 100% !important;
        }

        .col {
          width: 100% !important;
        }

        .col_cont {
          margin: 0 auto;
        }

        img.fullwidth,
        img.fullwidthOnMobile {
          max-width: 100% !important;
        }

        .no-stack .col {
          min-width: 0 !important;
          display: table-cell !important;
        }

        .no-stack.two-up .col {
          width: 50% !important;
        }

        .no-stack .col.num2 {
          width: 16.6% !important;
        }

        .no-stack .col.num3 {
          width: 25% !important;
        }

        .no-stack .col.num4 {
          width: 33% !important;
        }

        .no-stack .col.num5 {
          width: 41.6% !important;
        }

        .no-stack .col.num6 {
          width: 50% !important;
        }

        .no-stack .col.num7 {
          width: 58.3% !important;
        }

        .no-stack .col.num8 {
          width: 66.6% !important;
        }

        .no-stack .col.num9 {
          width: 75% !important;
        }

        .no-stack .col.num10 {
          width: 83.3% !important;
        }

        .video-block {
          max-width: none !important;
        }

        .mobile_hide {
          min-height: 0px;
          max-height: 0px;
          max-width: 0px;
          display: none;
          overflow: hidden;
          font-size: 0px;
        }

        .desktop_hide {
          display: block !important;
          max-height: none !important;
        }
      }
    </style>
    <style id="icon-media-query" type="text/css">
      @media (max-width: 520px) {
        .icons-inner {
          text-align: center;
        }

        .icons-inner td {
          margin: 0 auto;
        }
      }
    </style>
  </head>
  <body
    class="clean-body"
    style="
      margin: 0;
      padding: 0;
      -webkit-text-size-adjust: 100%;
      background-color: #ffffff;
    "
  >
    <!--[if IE]><div class="ie-browser"><![endif]-->
    <table
      bgcolor="#FFFFFF"
      cellpadding="0"
      cellspacing="0"
      class="nl-container"
      role="presentation"
      style="
        table-layout: fixed;
        vertical-align: top;
        min-width: 320px;
        border-spacing: 0;
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
        background-color: #ffffff;
        width: 100%;
      "
      valign="top"
      width="100%"
    >
      <tbody>
        <tr style="vertical-align: top" valign="top">
          <td style="word-break: break-word; vertical-align: top" valign="top">
            <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#FFFFFF"><![endif]-->
            <div style="background-color: #f5f5f5">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:5px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 0px;
                          padding-bottom: 5px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <div
                          align="center"
                          class="
                            img-container
                            center
                            fixedwidth
                            fullwidthOnMobile
                          "
                          style="padding-right: 0px; padding-left: 0px"
                        >
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="center"><!
                          [endif]--><a
                            href="https://firstregistrarsnigeria.com/"
                            style="outline: none"
                            tabindex="-1"
                            target="_blank"
                            ><img
                              align="center"
                              alt="First Registrars"
                              border="0"
                              class="center fixedwidth fullwidthOnMobile"
                              src="https://i.ibb.co/8ML8Zzg/Logo-FRIS.png"
                              style="
                                text-decoration: none;
                                -ms-interpolation-mode: bicubic;
                                height: auto;
                                border: 0;
                                width: 100%;
                                max-width: 275px;
                                display: block;
                                border-radius: 15px;
                              "
                              title="your-logo"
                              width="275"
                          /></a>
                          <div style="font-size: 1px; line-height: 10px"> </div>
                          <!--[if mso]></td></tr></table><![endif]-->
                        </div>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: #f5f5f5">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:0px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 5px;
                          padding-bottom: 0px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <div
                          align="center"
                          class="img-container center autowidth"
                          style="padding-right: 0px; padding-left: 0px"
                        >
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="center"><!
                          [endif]--><img
                            align="center"
                            border="0"
                            class="center autowidth"
                            src="https://i.ibb.co/KDscwyK/Top.png"
                            style="
                              text-decoration: none;
                              -ms-interpolation-mode: bicubic;
                              height: auto;
                              border: 0;
                              width: 100%;
                              max-width: 500px;
                              display: block;
                            "
                            width="500"
                          />
                          <!--[if mso]></td></tr></table><![endif]-->
                        </div>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: #f5f5f5">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: #ffffff;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: #ffffff;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:#ffffff"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:#ffffff;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:5px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 0px;
                          padding-bottom: 5px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <div
                          align="center"
                          class="img-container center fixedwidth"
                          style="padding-right: 5px; padding-left: 5px"
                        >
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 5px;padding-left: 5px;" align="center"><!
                          [endif]--><img
                            align="center"
                            alt="reset-password"
                            border="0"
                            class="center fixedwidth"
                            src="https://i.ibb.co/82MwzFY/pass-animate.gif"
                            style="
                              text-decoration: none;
                              -ms-interpolation-mode: bicubic;
                              height: auto;
                              border: 0;
                              width: 100%;
                              max-width: 350px;
                              display: block;
                            "
                            title="reset-password"
                            width="350"
                          />
                          <div style="font-size: 1px; line-height: 5px"> </div>
                          <!--[if mso]></td></tr></table><![endif]-->
                        </div>
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            table-layout: fixed;
                            vertical-align: top;
                            border-spacing: 0;
                            border-collapse: collapse;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                          "
                          valign="top"
                          width="100%"
                        >
                          <tr style="vertical-align: top" valign="top">
                            <td
                              align="center"
                              style="
                                word-break: break-word;
                                vertical-align: top;
                                padding-bottom: 0px;
                                padding-left: 0px;
                                padding-right: 0px;
                                padding-top: 0px;
                                text-align: center;
                                width: 100%;
                              "
                              valign="top"
                              width="100%"
                            >
                              <h1
                                style="
                                  color: #393d47;
                                  direction: ltr;
                                  font-family: Tahoma, Verdana, Segoe,
                                    sans-serif;
                                  font-size: 25px;
                                  font-weight: normal;
                                  letter-spacing: normal;
                                  line-height: 120%;
                                  text-align: center;
                                  margin-top: 0;
                                  margin-bottom: 0;
                                "
                              >
                                <strong>Your OTP Code </strong>
                              </h1>
                            </td>
                          </tr>
                        </table>
                        <div
                          align="center"
                          class="button-container"
                          style="
                            padding-top: 15px;
                            padding-right: 15px;
                            padding-bottom: 15px;
                            padding-left: 15px;
                          "
                        >
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-top: 15px; padding-right: 15px; padding-bottom: 15px; padding-left: 15px" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="" style="height:43.5pt;width:277.5pt;v-text-anchor:middle;" arcsize="35%" strokeweight="0.75pt" strokecolor="#FFC727" fillcolor="#ffc727"><w:anchorlock/><v:textbox inset="0,0,0,0"><center style="color:#393d47; font-family:Tahoma, Verdana, sans-serif; font-size:18px"><![endif]-->
                          <div
                            style="
                              text-decoration: none;
                              display: inline-block;
                              color: #393d47;
                              background-color: #ffc727;
                              border-radius: 20px;
                              -webkit-border-radius: 20px;
                              -moz-border-radius: 20px;
                              width: auto;
                              width: auto;
                              border-top: 1px solid #ffc727;
                              border-right: 1px solid #ffc727;
                              border-bottom: 1px solid #ffc727;
                              border-left: 1px solid #ffc727;
                              padding-top: 10px;
                              padding-bottom: 10px;
                              font-family: Tahoma, Verdana, Segoe, sans-serif;
                              text-align: center;
                              mso-border-alt: none;
                              word-break: keep-all;
                            "
                          >
                            <span
                              style="
                                padding-left: 50px;
                                padding-right: 50px;
                                font-size: 18px;
                                display: inline-block;
                                letter-spacing: normal;
                              "
                              ><span
                                style="
                                  font-size: 16px;
                                  line-height: 2;
                                  word-break: break-word;
                                  font-family: Tahoma, Verdana, Segoe,
                                    sans-serif;
                                  mso-line-height-alt: 32px;
                                "
                                ><span
                                  data-mce-style="font-size: 18px; line-height: 36px;"
                                  style="
                                    font-size: 18px;
                                    line-height: 36px;
                                    color: #fff;
                                  "
                                  ><strong> ${otp}</strong></span
                                ></span
                              ></span
                            >
                          </div>
                          <!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->
                        </div>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: #f5f5f5">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 0px;
                          padding-bottom: 0px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <div
                          align="center"
                          class="img-container center autowidth"
                          style="padding-right: 0px; padding-left: 0px"
                        >
                          <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="center"><!
                          [endif]--><img
                            align="center"
                            border="0"
                            class="center autowidth"
                            src="https://i.ibb.co/qFtk5d8/Btm.png"
                            style="
                              text-decoration: none;
                              -ms-interpolation-mode: bicubic;
                              height: auto;
                              border: 0;
                              width: 100%;
                              max-width: 500px;
                              display: block;
                            "
                            width="500"
                          />
                          <!--[if mso]></td></tr></table><![endif]-->
                        </div>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: #f5f5f5">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 5px;
                          padding-bottom: 5px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 15px; padding-left: 15px; padding-top: 15px; padding-bottom: 15px; font-family: Tahoma, Verdana, sans-serif"><![endif]-->
                        <div
                          style="
                            color: #393d47;
                            font-family: Tahoma, Verdana, Segoe, sans-serif;
                            line-height: 1.2;
                            padding-top: 15px;
                            padding-right: 15px;
                            padding-bottom: 15px;
                            padding-left: 15px;
                          "
                        >
                          <div
                            class="txtTinyMce-wrapper"
                            style="
                              line-height: 1.2;
                              font-size: 12px;
                              font-family: Tahoma, Verdana, Segoe, sans-serif;
                              color: #393d47;
                              mso-line-height-alt: 14px;
                            "
                          >
                            <p
                              style="
                                margin: 0;
                                font-size: 10px;
                                line-height: 1.2;
                                word-break: break-word;
                                text-align: center;
                                font-family: Tahoma, Verdana, Segoe, sans-serif;
                                mso-line-height-alt: 12px;
                                margin-top: 0;
                                margin-bottom: 0;
                              "
                            >
                              <span style="font-size: 11px"
                                >This code will expire in 3 Minutes. If you
                                continue to have problems</span
                              ><br /><span style="font-size: 10px"
                                >please feel free to contact us at
                                <a
                                  href="mailto:info@firstregistrarsnigeria.com"
                                  rel="noopener"
                                  style="
                                    text-decoration: underline;
                                    color: #393d47;
                                  "
                                  target="_blank"
                                  title="support@youremail.com"
                                  >info@firstregistrarsnigeria.com</a
                                ></span
                              >
                            </p>
                          </div>
                        </div>
                        <!--[if mso]></td></tr></table><![endif]-->
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: #fff">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 5px;
                          padding-bottom: 5px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <div
                          style="
                            font-size: 16px;
                            text-align: center;
                            font-family: Arial, Helvetica Neue, Helvetica,
                              sans-serif;
                          "
                        >
                          <div style="height: 30px"> </div>
                        </div>
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          class="social_icons"
                          role="presentation"
                          style="
                            table-layout: fixed;
                            vertical-align: top;
                            border-spacing: 0;
                            border-collapse: collapse;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                          "
                          valign="top"
                          width="100%"
                        >
                          <tbody>
                            <tr style="vertical-align: top" valign="top">
                              <td
                                style="
                                  word-break: break-word;
                                  vertical-align: top;
                                  padding-top: 0px;
                                  padding-right: 0px;
                                  padding-bottom: 0px;
                                  padding-left: 0px;
                                "
                                valign="top"
                              >
                                <table
                                  align="center"
                                  cellpadding="0"
                                  cellspacing="0"
                                  class="social_table"
                                  role="presentation"
                                  style="
                                    table-layout: fixed;
                                    vertical-align: top;
                                    border-spacing: 0;
                                    border-collapse: collapse;
                                    mso-table-tspace: 0;
                                    mso-table-rspace: 0;
                                    mso-table-bspace: 0;
                                    mso-table-lspace: 0;
                                  "
                                  valign="top"
                                >
                                  <tbody>
                                    <tr
                                      align="center"
                                      style="
                                        vertical-align: top;
                                        display: inline-block;
                                        text-align: center;
                                      "
                                      valign="top"
                                    >
                                      <td
                                        style="
                                          word-break: break-word;
                                          vertical-align: top;
                                          padding-bottom: 0;
                                          padding-right: 5px;
                                          padding-left: 5px;
                                        "
                                        valign="top"
                                      >
                                        <a
                                          href="https://www.facebook.com/firstregistrarsnigeria"
                                          target="_blank"
                                          ><img
                                            alt="Facebook"
                                            height="32"
                                            src="https://i.ibb.co/71gFPn0/facebook2x.png"
                                            style="
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              height: auto;
                                              border: 0;
                                              display: block;
                                            "
                                            title="Facebook"
                                            width="32"
                                        /></a>
                                      </td>
                                      <td
                                        style="
                                          word-break: break-word;
                                          vertical-align: top;
                                          padding-bottom: 0;
                                          padding-right: 5px;
                                          padding-left: 5px;
                                        "
                                        valign="top"
                                      >
                                        <a
                                          href="https://twitter.com/firstregistrars"
                                          target="_blank"
                                          ><img
                                            alt="Twitter"
                                            height="32"
                                            src="https://i.ibb.co/sRnsbhv/twitter2x.png"
                                            style="
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              height: auto;
                                              border: 0;
                                              display: block;
                                            "
                                            title="Twitter"
                                            width="32"
                                        /></a>
                                      </td>
                                      <td
                                        style="
                                          word-break: break-word;
                                          vertical-align: top;
                                          padding-bottom: 0;
                                          padding-right: 5px;
                                          padding-left: 5px;
                                        "
                                        valign="top"
                                      >
                                        <a
                                          href="https://instagram.com/firstregistrars"
                                          target="_blank"
                                          ><img
                                            alt="Instagram"
                                            height="32"
                                            src="https://i.ibb.co/k15MRw4/instagram2x.png"
                                            style="
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              height: auto;
                                              border: 0;
                                              display: block;
                                            "
                                            title="Instagram"
                                            width="32"
                                        /></a>
                                      </td>
                                      <td
                                        style="
                                          word-break: break-word;
                                          vertical-align: top;
                                          padding-bottom: 0;
                                          padding-right: 5px;
                                          padding-left: 5px;
                                        "
                                        valign="top"
                                      >
                                        <a
                                          href="https://www.linkedin.com/firstregistrars"
                                          target="_blank"
                                          ><img
                                            alt="LinkedIn"
                                            height="32"
                                            src="https://i.ibb.co/j4fmGJ8/linkedin2x.png"
                                            style="
                                              text-decoration: none;
                                              -ms-interpolation-mode: bicubic;
                                              height: auto;
                                              border: 0;
                                              display: block;
                                            "
                                            title="LinkedIn"
                                            width="32"
                                        /></a>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <div
                          style="
                            font-size: 16px;
                            text-align: center;
                            font-family: Arial, Helvetica Neue, Helvetica,
                              sans-serif;
                          "
                        >
                          <div
                            style="
                              margin-top: 25px;
                              border-top: 1px dashed #d6d6d6;
                              margin-bottom: 20px;
                            "
                          ></div>
                        </div>
                        <div
                          style="
                            font-size: 16px;
                            text-align: center;
                            font-family: Arial, Helvetica Neue, Helvetica,
                              sans-serif;
                          "
                        >
                          <div style="height-top: 20px"> </div>
                        </div>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <div style="background-color: transparent">
              <div
                class="block-grid"
                style="
                  min-width: 320px;
                  max-width: 500px;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                  word-break: break-word;
                  margin: 0 auto;
                  background-color: transparent;
                "
              >
                <div
                  style="
                    border-collapse: collapse;
                    display: table;
                    width: 100%;
                    background-color: transparent;
                  "
                >
                  <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                  <!--[if (mso)|(IE)]><td align="center" width="500" style="background-color:transparent;width:500px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                  <div
                    class="col num12"
                    style="
                      min-width: 320px;
                      max-width: 500px;
                      display: table-cell;
                      vertical-align: top;
                      width: 500px;
                    "
                  >
                    <div class="col_cont" style="width: 100% !important">
                      <!--[if (!mso)&(!IE)]><!-->
                      <div
                        style="
                          border-top: 0px solid transparent;
                          border-left: 0px solid transparent;
                          border-bottom: 0px solid transparent;
                          border-right: 0px solid transparent;
                          padding-top: 5px;
                          padding-bottom: 5px;
                          padding-right: 0px;
                          padding-left: 0px;
                        "
                      >
                        <!--<![endif]-->
                        <table
                          cellpadding="0"
                          cellspacing="0"
                          role="presentation"
                          style="
                            table-layout: fixed;
                            vertical-align: top;
                            border-spacing: 0;
                            border-collapse: collapse;
                            mso-table-lspace: 0pt;
                            mso-table-rspace: 0pt;
                          "
                          valign="top"
                          width="100%"
                        >
                          <tr style="vertical-align: top" valign="top">
                            <td
                              align="center"
                              style="
                                word-break: break-word;
                                vertical-align: top;
                                padding-top: 5px;
                                padding-right: 0px;
                                padding-bottom: 5px;
                                padding-left: 0px;
                                text-align: center;
                              "
                              valign="top"
                            >
                              <!--[if vml]><table align="left" cellpadding="0" cellspacing="0" role="presentation" style="display:inline-block;padding-left:0px;padding-right:0px;mso-table-lspace: 0pt;mso-table-rspace: 0pt;"><![endif]-->
                              <!--[if !vml]><!-->
                              <table
                                cellpadding="0"
                                cellspacing="0"
                                class="icons-inner"
                                role="presentation"
                                style="
                                  table-layout: fixed;
                                  vertical-align: top;
                                  border-spacing: 0;
                                  border-collapse: collapse;
                                  mso-table-lspace: 0pt;
                                  mso-table-rspace: 0pt;
                                  display: inline-block;
                                  margin-right: -4px;
                                  padding-left: 0px;
                                  padding-right: 0px;
                                "
                                valign="top"
                              >
                                <!--<![endif]-->
                                <tr style="vertical-align: top" valign="top">
                                  <td
                                    align="center"
                                    style="
                                      word-break: break-word;
                                      vertical-align: top;
                                      text-align: center;
                                      padding-top: 5px;
                                      padding-bottom: 5px;
                                      padding-left: 5px;
                                      padding-right: 6px;
                                    "
                                    valign="top"
                                  >
                                   
                                  </td>
                                  <td
                                    style="
                                      word-break: break-word;
                                      font-family: Arial, Helvetica Neue,
                                        Helvetica, sans-serif;
                                      font-size: 15px;
                                      color: #9d9d9d;
                                      vertical-align: middle;
                                      letter-spacing: undefined;
                                    "
                                    valign="middle"
                                  >
                                  
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                        <!--[if (!mso)&(!IE)]><!-->
                      </div>
                      <!--<![endif]-->
                    </div>
                  </div>
                  <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                  <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                </div>
              </div>
            </div>
            <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
          </td>
        </tr>
      </tbody>
    </table>
    <!--[if (IE)]></div><![endif]-->
  </body>
</html>

      
      
      `, // html body
    });

    const path = `/OTPcode/${otp}`;

    db.push(path, { fullHash, phone, otp, validatedEmail });

    return res.status(202).json({ status: true, msg: "OTP Sent via email" });
  } catch (error) {
    return res.status(404).json({ status: false, msg: error });
  }
};

exports.createDividends = async (req, res, next) => {
  const {
    sumofstock,
    numberofdividend,
    numberofpaiddividends,
    numberofoutstanding,
    phone,
    email,
  } = req.body;

  try {
    const dividendHolders = await Dividends.create({
      sumofstock,
      numberofdividend,
      numberofdividend,
      numberofpaiddividends,
      numberofoutstanding,
      phone,
      email,
    });

    return res.status(201).json({
      data: dividendHolders,
    });
  } catch (err) {
    return res.status(500).json({
      message: err,
    });
  }
};

//Get the Shareholder Dividends Via Email records
exports.shareholderDividendsviaEmail = async (req, res, next) => {
  try {
    const mail = req.email;

    //Initializing the email inputs
    const email = req.query.email;

    // Validate token the user inputs
    // if (mail !== email) {
    //   return res.status(403).json({
    //     message: "Forbidden !. Kindly make use of a Correct Token",
    //   });
    // }

    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const shareholderInfo = await sequelize.query(
      `SELECT mail FROM [Estock].[dbo].[api_shareinfo_company] where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    console.log(shareholderInfo);
    // const shareholderInfo = await api_shareholderinfo_company
    //   .findAndCountAll({
    //     //where: Sequelize.or({ mobile }, { email }),
    //     where: { mail: email },
    //   })
    //   .then((data) => {
    //     return data;
    //   })
    //   .catch((err) => {
    //     return err;
    //   });

    if (shareholderInfo === undefined || shareholderInfo.length == 0) {
      return res.status(404).json({
        msg: `Invalid input. Kindly note that, ${
          email || "email"
        }, dosen't exist, pls retry with a valid input`,

        status: false,
      });
    }

    //Query on the Database

    const countStock = await sequelize.query(
      ` select count(mail) AS counts from [Estock].[dbo].[api_getStock] where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const shareholderDetails = await sequelize.query(
      ` SELECT account_number, names AS shareholder_name, address, Company_name, mail AS email, mobile FROM [Estock].[dbo].[api_shareinfo_company] where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const stockDetails = await sequelize.query(
      `SELECT account_number AS shareholder_accountno, names AS shareholder_name, mobile, FORMAT(Holdings,'#,0') AS Holdings, mail AS email FROM api_getStock where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const claimedDividends = await sequelize.query(
      `SELECT account_no AS shareholder_accountno, name AS shareholder_name, company_name AS name_of_stock, paymentno, divrate AS dividend_rate, YEAR(yrend) AS yrend,  FORMAT(date_paid, 'dd-MM-yyyy') AS date_paid, mobile, mail AS email, FORMAT(divdate_payable, 'dd-MM-yyyy') AS divdate_payable FROM api_claimed_dividend where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const unclaimedDividends = await sequelize.query(
      `SELECT account_no AS shareholder_accountno, name AS shareholder_name, company_name AS name_of_stock, paymentno, divrate AS dividend_rate, YEAR(yrend) AS yrend, FORMAT(date_paid, 'dd-MM-yyyy') AS date_paid, mobile, mail AS email, FORMAT(divdate_payable, 'dd-MM-yyyy') AS divdate_payable FROM api_unclaimeddividendbyphone where mail = '${email}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    // const countStock = await api_Tcountbyemail
    //   .findAll({
    //     where: { mail: email },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // const shareholderDetails = await api_shareholderinfo_company
    //   .findOne({
    //     where: { mail: email },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // // T_Shold

    // // const shareholderDetails = await T_shold.findOne({
    // //   where: { email },
    // // })
    // //   .then((g) => {
    // //     return g;
    // //   })
    // //   .catch((e) => {
    // //     return e;
    // //   });

    // // console.log(shareholderDetails);

    // // const users = await sequelize.query(
    // //   `SELECT * FROM T_shold where email = '${email}'`,
    // //   {
    // //     type: QueryTypes.SELECT,
    // //   }
    // // );

    // // console.log(users);
    // // We didn't need to destructure the result here - the results were returned directly

    // const stockDetails = await TgetStocks.findAndCountAll({
    //   // limit: size,
    //   // offset: page * size,
    //   // attributes: [["account_number", "shareholder_accountno"]],
    //   attributes: [
    //     ["account_number", "shareholder_accountno"],
    //     ["names", "shareholder_name"],
    //     ["company_name", "name_of_stock"],
    //     "mobile",
    //     "Holdings",
    //     ["mail", "email"],
    //   ],
    //   where: {
    //     mail: email,
    //   },
    // })
    //   .then((data) => {
    //     return data;
    //   })
    //   .catch((err) => {
    //     return err;
    //   });

    // //console.log(stockDetails);

    // const claimedDividends = await api_TClaimedDividend
    //   .findAndCountAll({
    //     // limit: size,
    //     // offset: page * size,
    //     attributes: [
    //       ["account_no", "shareholder_accountno"],
    //       ["Name", "shareholder_name"],
    //       ["company_name", "name_of_stock"],
    //       "paymentno",
    //       ["divrate", "dividend_rate"],
    //       "yrend",
    //       "date_paid",
    //       "mobile",
    //       "mail",
    //       "divdate_payable",
    //     ],
    //     where: { mail: email },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // const unclaimedDividends = await api_TunClaimedDividend
    //   .findAndCountAll({
    //     // limit: size,
    //     // offset: page * size,
    //     attributes: [
    //       ["account_no", "shareholder_accountno"],
    //       ["Name", "shareholder_name"],
    //       ["company_name", "name_of_stock"],
    //       "paymentno",
    //       ["divrate", "dividend_rate"],
    //       "yrend",
    //       "date_paid",
    //       "mobile",
    //       "mail",
    //       "divdate_payable",
    //     ],
    //     where: { mail: email },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // //Update the Token back to 0

    // // await request.put({
    // //   headers: { "content-type": "application/json" },
    // //   url: "https://firstregistrarstoken.herokuapp.com/v1/tokens",
    // //   body: JSON.stringify({ values: "" }),
    // // });

    return res.status(202).json({
      status: true,
      shareholderDetails,
      stocks_count: countStock[0].counts,
      stocksInformation: stockDetails,
      claimedDividendsInforamtion_with_payment_history: claimedDividends,
      unclaimedDividendsInformation: unclaimedDividends,
    });
  } catch (error) {
    return res
      .status(404)
      .json({ status: false, msg: "An Error occured", error });
  }
};

// Get Shareholder Dividends Via Phone

exports.shareholderDividendsviaPhone = async (req, res, next) => {
  try {
    const phone = req.phone;

    //Pagination of the endpoints.
    // const pageAsNumber = Number.parseInt(req.query.page);
    // const sizeAsNumber = Number.parseInt(req.query.size);

    // let page = 0;

    // if (!Number.isNaN(pageAsNumber) && pageAsNumber > 0) {
    //   page = pageAsNumber;
    // }

    // let size = 10;

    // if (!Number.isNaN(sizeAsNumber) && sizeAsNumber > 0 && sizeAsNumber > 10) {
    //   size = sizeAsNumber;
    // }

    // Intializing the mobile number
    const mobiles = req.query.phone;

    // Validate token the user inputs
    // if (phone !== mobiles) {
    //   return res.status(403).json({
    //     message: "Forbidden !. Kindly make use of a Correct Token",
    //   });
    // }

    // Error Handling on the Users Entity
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const mobile = mobiles; //parseInt(mobiles, 10).toString();

    // const shareholderInfo = await api_shareholderinfo_company
    //   .findOne({
    //     //where: Sequelize.or({ mobile }, { email }),
    //     where: { mobile },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    const shareholderInfo = await sequelize.query(
      `SELECT * FROM [Estock].[dbo].[api_shareinfo_company] where mobile = '${mobile}'`,
      {
        type: QueryTypes.SELECT,
      }
    );
    if (shareholderInfo === undefined || shareholderInfo.length == 0) {
      return res.status(404).json({
        msg: `Invalid input. Kindly know that ${
          mobile || "mobile"
        }, doesn't exist, pls retry with a valid input`,

        status: false,
      });
    }

    //Query on the Database

    const countStock = await sequelize.query(
      `
      select count(mobile) AS counts from [Estock].[dbo].[api_getStock] where mobile = '${mobile}'
     `,
      {
        type: QueryTypes.SELECT,
      }
    );

    const shareholderDetails = await sequelize.query(
      `SELECT account_number, names AS shareholder_name, address, Company_name, mail, mobile FROM [Estock].[dbo].[api_shareinfo_company] where mobile = '${mobile}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const stockDetails = await sequelize.query(
      `SELECT account_number AS shareholder_accountno, names AS shareholder_name, mobile, FORMAT(Holdings,'#,0') AS Holdings, mail AS email FROM api_getStock where mobile = '${mobile}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const claimedDividends = await sequelize.query(
      `SELECT account_no AS shareholder_accountno, name AS shareholder_name, company_name AS name_of_stock, paymentno, divrate AS dividend_rate, YEAR(yrend) AS yrend,  FORMAT(date_paid, 'dd-MM-yyyy') AS date_paid, mobile, mail, FORMAT(divdate_payable, 'dd-MM-yyyy') AS divdate_payable FROM api_claimed_dividend where mobile = '${mobile}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    const unclaimedDividends = await sequelize.query(
      `SELECT account_no AS shareholder_accountno, name AS shareholder_name, company_name AS name_of_stock, paymentno, divrate AS dividend_rate, YEAR(yrend) AS yrend, FORMAT(date_paid, 'dd-MM-yyyy') AS date_paid, mobile, mail, FORMAT(divdate_payable, 'dd-MM-yyyy') AS divdate_payable FROM api_unclaimeddividendbyphone where mobile = '${mobile}'`,
      {
        type: QueryTypes.SELECT,
      }
    );

    // const countStock = await api_Tcountbyphone
    //   .findAll({
    //     where: { mobile },
    //   })
    //   .then((g) => {
    //     console.log(g);
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // const shareholderDetails = await api_shareholderinfo_company
    //   .findOne({
    //     where: { mobile },
    //   })
    //   .then((g) => {
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // const stockDetails = await TgetStocks.findAndCountAll({
    //   // limit: size,
    //   // offset: page * size,
    //   attributes: [
    //     ["account_number", "shareholder_accountno"],
    //     ["names", "shareholder_name"],
    //     ["company_name", "name_of_stock"],
    //     "mobile",
    //     "Holdings",
    //     ["mail", "email"],
    //   ],
    //   where: {
    //     mobile,
    //   },
    // })
    //   .then((g) => {
    //     console.log(g);
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    //console.log(stockDetails);

    // const claimedDividends = await api_TClaimedDividend
    //   .findAndCountAll({
    //     // limit: size,
    //     // offset: page * size,
    //     attributes: [
    //       ["account_no", "shareholder_accountno"],
    //       ["name", "shareholder_name"],
    //       ["company_name", "name_of_stock"],
    //       "paymentno",
    //       ["divrate", "dividend_rate"],
    //       "yrend",
    //       "date_paid",
    //       "mobile",
    //       "mail",
    //       "divdate_payable",
    //     ],
    //     where: { mobile },
    //   })
    //   .then((g) => {
    //     console.log(g);
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    // const unclaimedDividends = await api_TunClaimedDividend
    //   .findAndCountAll({
    //     // limit: size,
    //     // offset: page * size,
    //     attributes: [
    //       ["account_no", "shareholder_accountno"],
    //       ["Name", "shareholder_name"],
    //       ["company_name", "name_of_stock"],
    //       "paymentno",
    //       ["divrate", "dividend_rate"],
    //       "yrend",
    //       "date_paid",
    //       "mobile",
    //       "mail",
    //       "divdate_payable",
    //     ],
    //     where: { mobile },
    //   })
    //   .then((g) => {
    //     console.log(g);
    //     return g;
    //   })
    //   .catch((e) => {
    //     return e;
    //   });

    //Update the Token back to 0

    // await request.put({
    //   headers: { "content-type": "application/json" },
    //   url: "https://firstregistrarstoken.herokuapp.com/v1/tokens",
    //   body: JSON.stringify({ values: "" }),
    // });

    // console.log(stockDetails);

    return res.status(202).json({
      status: true,
      stocks_count: countStock[0].counts,
      shareholderDetails,
      stocksInformation: stockDetails,
      claimedDividendsInforamtion_with_payment_history: claimedDividends,
      unclaimedDividendsInformation: unclaimedDividends,
    });
  } catch (error) {
    return res.status(404).json({ status: false, msg: "An Error occured" });
  }
};

// Middleware

exports.auth = (credentials = []) => {
  return (req, res, next) => {
    let tokenID = req.headers["authorization"];

    if (typeof credentials === "string") {
      credentials = [credentials];
    }

    if (!tokenID) {
      return res.status(401).json({
        status: false,
        message: "Sorry access denied, kindly retry again",
      });
    } else {
      const tokenBody = tokenID.slice(7);
      jwt.verify(tokenBody, JWT_AUTH_TOKEN, (err, decoded) => {
        if (!err) {
          // req.user = user;
          if (credentials.length > 0) {
            if (
              decoded.scopes &&
              decoded.scopes.length &&
              credentials.some((cred) => decoded.scopes.indexOf(cred) >= 0)
            ) {
              req.email = decoded.email;
              req.phone = decoded.phone;
              next();
            } else {
              return res.status(401).json({
                status: false,
                message: "Sorry access denied, kindly retry again",
              });
            }
          } else {
            // No crediental required
            req.email = decoded.email;
            req.phone = decoded.phone;
            next();
          }
        } else {
          res.status(401).json({
            status: false,
            message: "Not Authorized !, kindly retry",
          });
        }
      });
    }
  };
};

//Refresh code
exports.refreshTokenrenew = (req, res, next) => {
  let tokenID = req.cookies.JWT_REFRESH_ID;

  if (!tokenID) {
    return res
      .status(403)
      .json({ message: "Refresh token not found, Kindly retry login" });
  }

  // if (!refreshTokensID.includes(tokenID)) {
  //   return res
  //     .status(403)
  //     .send({ message: "Refresh token blocked, login again" });
  // }
  clientRedis.get(tokenID, (err, token) => {
    jwt.verify(token, JWT_REFRESH_TOKEN, (err, data) => {
      try {
        if (data) {
          clientRedis.get("counter", (err, data) => {
            clientRedis.set("counter", parseInt(data) + 1);

            jwt.sign(
              { data: data },
              JWT_AUTH_TOKEN,
              {
                expiresIn: "5400s",
              },
              (err, accessToken) => {
                clientRedis.set(parseInt(data) + 3, accessToken);
              }
            );
            return res
              .status(200)
              .cookie("JWT_ID", parseInt(data) + 3)
              .end();
          });
        }
      } catch (error) {
        return res.status(403).json({
          status: false,
          message: `Invalid refresh token. Pls try again -  ${error}`,
        });
      }
    });
  });
};
