const cors = require("cors");
const csv = require("csv-parser");
const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");

require("dotenv").config();

const { sendEmail } = require("./gmail");

const {
  Coupon,
  User,
  getCouponCode,
  createUserAndCouponCode,
} = require("./database");

// set up multer for file uploads
const upload = multer({ dest: "./mounted/uploads/" });

// set up express server
const app = express();
const port = 3000;
const corsOptions = {
  origin: "http://localhost:5173",
};

app.use(cors(corsOptions));

var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// serve compiled react code
app.use(express.static(path.join(__dirname, "./mounted/dist")));

/**
 * Get all coupons and associated users.
 */
app.get("/api/coupons", async (req, res) => {
  const coupons = await Coupon.findAll({
    include: [
      {
        model: User,
        attributes: ["first_name", "last_name", "phone", "email"],
      },
    ],
  });
  res.json(coupons);
});

/**
 * Get coupon code from tracking code.
 */
app.get("/api/discount", async (req, res) => {
  const trackingCode = req.query.code;
  if (trackingCode === undefined) {
    return res.status(400).json({ error: "Missing code" });
  }

  const couponCode = await getCouponCode(trackingCode);
  if (couponCode === null) {
    return res.status(404).json({ error: "Coupon not found or already used" });
  }

  res.send(`Here's your coupon code: ${couponCode}`);
});

/**
 * Use a coupon code so it can't be used again.
 */
app.post("/api/coupon/use", async (req, res) => {
  const couponCode = req.body.couponCode;
  if (couponCode === undefined) {
    return res.status(400).json({ error: "Missing coupon code" });
  }
  const [updatedRowsCount, updatedCoupons] = await Coupon.update(
    { used: true },
    {
      where: {
        coupon_code: couponCode,
        used: false,
      },
      returning: true,
    }
  );

  if (updatedRowsCount === 0) {
    return res.sendStatus(404);
  }
  return res.sendStatus(200);
});

/**
 * Upload list of users in CSV file.
 */
app.post("/api/upload", upload.single("file"), (req, res) => {
  let discount = 25;
  try {
    const discountPercent = req.body.discountPercent;
    if (discountPercent === undefined) {
      return res.status(400).json({ error: "Missing discountPercent" });
    }

    discount = parseInt(discountPercent, 10);
    if (discount <= 0 || discount > 100) {
      throw Exception();
    }
  } catch (Exception) {
    return res.status(400).send("Invalid discount amount");
  }

  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", async (data) => {
      const trackingCode = await createUserAndCouponCode(
        data.name,
        data.phone,
        data.email,
        discount
      );

      const subject = "New Table Aura Deal";
      const bodyHtml = `<p>Check out our new deal for ${discount}% off at a restaurant near you! Click <a href="http://localhost:3000/api/discount?code=${trackingCode}">here</a> to get your coupon code. Use the coupon code when you purchase any meal in-store.</p>`;
      await sendEmail(data.email, subject, bodyHtml);
    })
    .on("end", () => {
      fs.unlinkSync(req.file.path); // Delete the uploaded file
    });
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
