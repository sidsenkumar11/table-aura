const process = require("process");
const { Sequelize, DataTypes } = require("sequelize");
const {
  generateCouponCode,
  splitName,
  generateTrackingCode,
} = require("./util");

const sequelize = new Sequelize(
  process.env.POSTGRES_DB,
  process.env.POSTGRES_USER,
  process.env.POSTGRES_PASSWORD,
  {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRESS_PORT,
    dialect: "postgres",
    logging: false,
  }
);

// Define the User model
const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    tableName: "users",
  }
);

// Define the Coupon model
const Coupon = sequelize.define(
  "Coupon",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tracking_code: {
      type: DataTypes.STRING,
      defaultValue: generateTrackingCode,
      allowNull: false,
      unique: true,
    },
    coupon_code: {
      type: DataTypes.STRING(6),
      allowNull: false,
      unique: true,
      defaultValue: generateCouponCode,
    },
    clicked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 25,
    },
  },
  {
    tableName: "coupons",
  }
);

// Define the relationship
User.hasMany(Coupon);
Coupon.belongsTo(User);

// Sync the models with the database
sequelize.sync({ alter: true });

/**
 * Creates a new user and coupon code in the database.
 */
const createUserAndCouponCode = async (name, phone, email, discount) => {
  let user = await User.findOne({ where: { phone: phone } });

  if (!user) {
    const { firstName, lastName } = splitName(name);
    try {
      user = await User.create({
        first_name: firstName,
        last_name: lastName,
        phone: phone,
        email: email,
      });
    } catch (Exception) {
      return null;
    }
  }

  const coupon = await Coupon.create({
    UserId: user.id,
    discount: discount,
  });

  return coupon.tracking_code;
};

/**
 * Get a coupon code from a tracking code.
 */
async function getCouponCode(trackingCode) {
  const [updatedRowsCount, updatedCoupons] = await Coupon.update(
    { clicked: true },
    {
      where: {
        tracking_code: trackingCode,
      },
      returning: true,
    }
  );

  if (updatedCoupons[0]) {
    return updatedCoupons[0].coupon_code;
  }

  return null;
}

module.exports = { User, Coupon, createUserAndCouponCode, getCouponCode };
