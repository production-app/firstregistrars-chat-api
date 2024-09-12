const express = require("express");
const cookieParser = require("cookie-parser");
const router = express.Router();
const { check, query, validationResult } = require("express-validator");

const {
  createDividends,
  vertifyEmailAddress,
  vertifyPhoneNumber,
  sendOtpEmail,
  sendOtpSms,
  validateOtp,
  shareholderDividendsviaEmail,
  shareholderDividendsviaPhone,
  auth,
  refreshTokenrenew,
  createTokenUsers,
} = require("../controllers/shareholder");

// Create entry into the table

router.route("/create").post(createDividends);

// Create Token Users
router
  .route("/createusers")
  .post(
    [
      check("username")
        .isEmail()
        .trim()
        .withMessage({ message: "Not a valid email address" }),

      check("password")
        .isLength({ min: 20 })
        .trim()
        .withMessage({ message: "must be at least 20 chars long" })
        .matches(/\d/)
        .withMessage("must contain a number"),
    ],
    createTokenUsers
  );

// To vertify the existence of an email address in the table

router
  .route("/email/:email")
  .get(
    [
      check("email")
        .isEmail()
        .trim()
        .withMessage({ message: "Not a valid email address" }),
    ],
    vertifyEmailAddress
  );

// To vertify the existence of phone number in the table

router.route("/phone/:phone").get(
  [
    check("phone")
      .isLength({ min: 11, max: 11 })
      .trim()
      .matches(/[0-9]+/)
      .withMessage({ message: "Must be 11 digts Long" }),
  ],
  vertifyPhoneNumber
);

// Send OTP

router
  .route("/sendOTP")
  .post(
    [
      check("phone")
        .isLength({ min: 11, max: 11 })
        .trim()
        .matches(/\d/)
        .withMessage({ message: "Must be 11 digts Long" }),
    ],
    sendOtpSms
  );

// ValidateOTP for SMS

router
  .route("/validateOTP")
  .post(
    [
      check("otp")
        .isLength({ min: 6, max: 6 })
        .trim()
        .withMessage({ message: "Must be 6 digts Long" }),
    ],
    validateOtp
  );

//Send OTP request via email
router
  .route("/SendEmailOTP")
  .post(
    [
      check("email")
        .isEmail()
        .trim()
        .withMessage({ message: "Not a valid email address" }),
    ],
    sendOtpEmail
  );

//Creating Dividends records
router.route("/dividends").post(createDividends);

//Route for refresh token
router.route("/refresh").get(refreshTokenrenew);

//Get the dividends Info via Email
//router.route("/customersdetails").get(auth, shareholderDividends);

router.route("/customersdetailsemail").get(
  [
    check("email").isEmail().trim().withMessage({
      message: "Not a valid email address",
    }),
    // check("phone")
    //   .isLength({ min: 11, max: 11 })
    //   .optional({ nullable: true, checkFalsy: true })
    //   .trim()
    //   .matches(/\d/)
    //   .withMessage({ message: "Must be 11 digits Long" }),
  ],
  // auth("shareholders:lookup"),
  shareholderDividendsviaEmail
);

router.route("/customersdetailsphone").get(
  [
    // check("email").isEmail().trim().withMessage({
    //   message: "Not a valid email address",
    // }),
    check("phone")
      .isLength({ min: 11, max: 11 })
      .trim()
      .matches(/\d/)
      .withMessage({ message: "Must be 11 digits Long" }),
  ],
  // auth("shareholders:lookup"),
  shareholderDividendsviaPhone
);

module.exports = router;
