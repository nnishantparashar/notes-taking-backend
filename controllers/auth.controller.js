const Users = require("../models/user.model");
const TempUsers = require("../models/tempUser.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Tokens = require("../models/token.model");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { sendEmail } = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const payload = req.body;
    //Check if user is registered or not if yes return msg
    const existingUser = await Users.findOne({ email: payload.email });
    if (existingUser) {
      return res.status(400).send({
        message: "User with given email already exist.",
      });
    }
    //Check if user is in tempUser, then delete existing,

    const existingTemp = await TempUsers.findOne({ email: payload.email });
    if (existingTemp) {
      await TempUsers.deleteOne();
    }
    //Save new tempUser and Send activation mail.

    const hashedValue = await bcrypt.hash(payload.password, 10);
    payload.hashedPassword = hashedValue;
    delete payload.password;
    const tempUser = new TempUsers(payload);
    tempUser
      .save()
      .then(async (data) => {
        const temp = await TempUsers.findOne({ email: payload.email });
        const tempId = temp._id;
        let token = await Tokens.findOne({ userId: tempId });

        if (token) {
          
          await token.deleteOne();
        }

        const newToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = await bcrypt.hash(newToken, 10);

        const tokenPayload = new Tokens({ userId: tempId, token: hashedToken });

        await tokenPayload.save();

        const link = `http://localhost:3000/activate-account/?token=${newToken}&tempId=${tempId}`;

        const isMailSent = await sendEmail(payload.email, "ACTIVATE ACCOUNT", {
          accountActivationLink: link,
        });
        if (isMailSent) {
          return res.status(200).send({
            message:
              "Registered Successfully. Account activation link has been sent to email.",
          });
        }
        return res.status(500).send({
          message: "Error while sending email.",
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while registering a new user.",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.activateAccount = async (req, res) => {
  try {
    const { tempId, token } = req.body;
    const activationToken = await Tokens.findOne({ userId: tempId });
    if (!activationToken) {
      return res.status(401).send({
        message: "Token doesn't exist.",
      });
    }

    const isValidToken = await bcrypt.compare(token, activationToken.token);

    if (!isValidToken) {
      return res.status(400).send({
        message: "Invalid Token.",
      });
    }
    //Save new User and delete tempUser
    const temp = await TempUsers.findById({
      _id: new mongoose.Types.ObjectId(tempId),
    });
    const payload = {
      name: temp.name,
      email: temp.email,
      mobile: temp.mobileNumber,
      hashedPassword: temp.hashedPassword,
    };
    const User = new Users(payload);
    User.save()
      .then(async (data) => {
        await temp.deleteOne();
        activationToken.deleteOne();
        res.status(200).send({
          message: "Account has been activated successfully.",
          data: data,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while activating user's account.",
          error: error,
        });
      });
  } catch (error) {
    return res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await Users.findOne({ email: email });
    // check for existing user
    if (!existingUser) {
      res.status(400).send({
        message: "User doesnt exist with the given email.",
      });
    }

    const id = existingUser._id.toString();
    const name = existingUser.name;
    const data = {
      id: id,
      email: email,
      name: name,
    };
    const isValidUser = await bcrypt.compare(
      password,
      existingUser.hashedPassword
    );
    if (isValidUser) {
      const token = await jwt.sign(
        { _id: existingUser._id },
        process.env.SECRET_KEY
      );
      res.cookie("accessToken", token, {
        expires: new Date(Date.now() + 86400000),
      });
      return res.status(200).send({
        message: "User logged-in successfully.",
        data: data,
        accessToken: token,
      });
    }
    return res.status(400).send({
      message: "Invalid credentials.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};
// is this making any sense??
exports.logout = async (req, res) => {
  try {
    await res.clearCookie("accessToken");

    return res.status(200).send({
      message: "User logged-out successfully.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).send({
        message: "Email is required.",
      });
    }
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.status(400).send({
        message: "User with given email doesn't exist.",
      });
    }

    let token = await Tokens.findOne({ userId: user._id });

    if (token) {
      await token.deleteOne();
    }

    const newToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(newToken, 10);

    const tokenPayload = new Tokens({ userId: user._id, token: hashedToken });

    await tokenPayload.save();

    //Replace this link with live link, after deployment.
    const link = `http://localhost:3000/reset-password/?token=${newToken}&userId=${user._id}`;

    const isMailSent = await sendEmail(user.email, "RESET PASSWORD", {
      resetPasswordLink: link,
    });

    if (isMailSent) {
      return res.status(200).send({
        message: "Password reset link has been sent to email.",
      });
    }

    return res.status(400).send({
      message: "Error while sending email.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { userId, token, newPassword } = req.body;
    const resetToken = await Tokens.findOne({ userId: userId });
    if (!resetToken) {
      return res.status(401).send({
        message: "Token doesn't exist.",
      });
    }

    const isValidToken = await bcrypt.compare(token, resetToken.token);

    if (!isValidToken) {
      return res.status(400).send({
        message: "Invalid Token.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    Users.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { hashedPassword: hashedPassword } }
    )
      .then(async (data) => {
        await resetToken.deleteOne();
        res.status(200).send({
          message: "Password has been reset successfully.",
          userId: data._id,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while resetting user's password.",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
};
