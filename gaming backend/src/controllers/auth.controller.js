const { User, Profile, Game, KycDocument, UserAchievement } = require("../models");
const { apiResponse, setAuthCookie, verifyToken, clearAuthCookies } = require("../utils");
const {
  deleteManyFromS3,
  keyFromLocationUrl,
  collectImageKeys,
} = require("../services/uploadToS3");
const bcrypt = require("bcrypt");
const { generateOtpService } = require("../services");
const redisClient = require("../config/redis");
const { ACCOUNT_STATUS, KYC_STATUS } = require("../constants/userStatus");
const jwt = require("jsonwebtoken");

const authController = {

  async generateOtp(req, res, next) {
    try {
      const { email = "", phone = "", purpose = "" } = req.body;
      const existingUser = await User.findOne({
        $or: [
          ...(email ? [{ email: email?.toLowerCase() }] : []),
          ...(phone ? [{ phone: phone?.trim() }] : []),
        ],
      });
      console.log("existingUser", existingUser);
      if (purpose === "login" || purpose === "forgot-password") {
        if (!existingUser) return apiResponse.failure(res, "User not found, please register first", 404);
      } else if (purpose === "register") {
        if (existingUser) return apiResponse.failure(res, `User with this ${email ? "email" : "phone"} already exists`, 400);
      }
      const prefix =
        purpose === "login"
          ? "otp:login"
          : purpose === "forgot-password"
            ? "otp:forgot-password"
            : "otp";
      const key = email
        ? `${prefix}:email:${email.toLowerCase()}`
        : `${prefix}:phone:${phone.trim()}`;

      const existingOtp = await redisClient.client.get(key);
      if (existingOtp) {
        const ttl = await redisClient.client.ttl(key);
        return apiResponse.failure(
          res,
          `OTP already sent. Please wait ${ttl > 0 ? ttl : 120} seconds before requesting a new one.`,
          429,
        );
      }
      const otp = generateOtpService();
      await redisClient.client.set(key, otp, { EX: 60 * 5 });
      return apiResponse.success(res, { message: "OTP sent successfully" }, "OTP sent successfully", 200);
    } catch (err) {
      next(err);
    }
  },

  async verifyOtp(req, res, next) {
    try {
      const { email, phone, code, purpose = "register" } = req.body;

      const isForgotPassword = purpose === "forgot-password";
      const otpPrefix = isForgotPassword ? "otp:forgot-password" : "otp";
      const verifiedPrefix = isForgotPassword ? "verified:forgot-password" : "verified";

      if (email) {
        const otpKey = `${otpPrefix}:email:${email.toLowerCase()}`;
        const verifiedKey = `${verifiedPrefix}:email:${email.toLowerCase()}`;
        const otp = await redisClient.client.get(otpKey);
        if (!otp) return apiResponse.failure(res, "Email OTP expired or invalid", 400);
        if (otp !== code) return apiResponse.failure(res, "Email OTP invalid", 400);
        await redisClient.client.del(otpKey);
        await redisClient.client.set(verifiedKey, new Date().toISOString(), { EX: 60 * 5 });
      }

      if (phone) {
        const otpKey = `${otpPrefix}:phone:${phone.trim()}`;
        const verifiedKey = `${verifiedPrefix}:phone:${phone.trim()}`;
        const otp = await redisClient.client.get(otpKey);
        if (!otp) return apiResponse.failure(res, "Phone OTP expired or invalid", 400);
        if (otp !== code) return apiResponse.failure(res, "Phone OTP invalid", 400);
        await redisClient.client.del(otpKey);
        await redisClient.client.set(verifiedKey, new Date().toISOString(), { EX: 60 * 5 });
      }

      const message = isForgotPassword ? "OTP verified. You can now reset your password." : "OTP verified successfully";
      return apiResponse.success(res, { message }, "OTP verified successfully", 200);
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { email, phone, newPassword } = req.body;
      const verifiedKey = email
        ? `verified:forgot-password:email:${email.toLowerCase()}`
        : `verified:forgot-password:phone:${phone.trim()}`;

      const verified = await redisClient.client.get(verifiedKey);
      if (!verified) return apiResponse.failure(res, "Please verify OTP first or verification has expired.", 400);

      const user = await User.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone: phone.trim() }] : []),
        ],
      }).select("+password");
      if (!user) return apiResponse.failure(res, "User not found", 404);

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
      await redisClient.client.del(verifiedKey);

      return apiResponse.success(res, { message: "Password reset successfully" }, "Password reset successfully", 200);
    } catch (err) {
      next(err);
    }
  },

  async register(req, res, next) {
    try {
      const { email, phone, password, role } = req.body;
      const existingUser = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { phone: phone?.trim() }] });
      if (existingUser) return apiResponse.failure(res, `User with this ${email ? "email" : "phone"} already exists`, 400);

      if (!email && !phone) {
        return apiResponse.failure(res, "Email or phone is required", 400);
      }
          
      const verifiedEmail = email
        ? await redisClient.client.get(`verified:email:${email.toLowerCase()}`)
        : null;

      const verifiedPhone = phone
        ? await redisClient.client.get(`verified:phone:${phone}`)
        : null;

      if (!verifiedEmail && !verifiedPhone) {
        return apiResponse.failure(res, "Please verify your email or phone before registering", 400);
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      if (role !== "gamer" && role !== "admin") {
        return apiResponse.failure(res, "Only gamer and admin roles are allowed", 400);
      }
      const newUser = await User.create({
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        password: hashedPassword,
        role,
        status: ACCOUNT_STATUS.PENDING,
        kycStatus: KYC_STATUS.NOT_SUBMITTED,
        // correct data when email or phone is verified
        ...(email && { emailVerifiedAt: new Date() }),
        ...(phone && { phoneVerifiedAt: new Date() }),
      });
      await Profile.create({ user: newUser._id }).catch(() => {});
      setAuthCookie(res, newUser._id, newUser.role);
      return apiResponse.success(res, { userId: newUser._id, email: newUser.email, phone: newUser.phone, role: newUser.role }, "User registered successfully", 201);
    } catch (err) {
      next(err)
    }
  },

  async loginEmailOrPhone(req, res, next) {
    try {
      const { email, phone, password } = req.body;

      const user = await User.findOne({
        $or: [
          ...(email ? [{ email: email.toLowerCase() }] : []),
          ...(phone ? [{ phone: phone.trim() }] : []),
        ]
      }).select("+password +googleId"); // ✅ also select googleId

      // 1. User not found
      if (!user) return apiResponse.failure(res, "User not found", 404);

      // 2. Account status checks
      if (user.status === ACCOUNT_STATUS.SUSPENDED) return apiResponse.failure(res, "Account suspended", 403);
      if (user.status === ACCOUNT_STATUS.DEACTIVATED) return apiResponse.failure(res, "Account deactivated", 403);

      // 3. Google user — no password
      if (!user.password) return apiResponse.failure(res, "This account uses Google login. Please sign in with Google.", 400);

      // 4. Wrong password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return apiResponse.failure(res, "Invalid password", 400);

      const updates = { lastSeenAt: new Date() };
      await User.updateOne({ _id: user._id }, { $set: updates });

      setAuthCookie(res, user._id, user.role);
      const userObject = user.toObject();
      delete userObject.password;
      delete userObject.googleId;
      userObject.lastSeenAt = updates.lastSeenAt;

      return apiResponse.success(res, { user: userObject }, "Login successful", 200);
    } catch (err) {
      next(err);
    }
  },

  async loginWithOtp(req, res, next) {
    try {
      const { email, phone, code } = req.body;
      const user = await User.findOne({ $or: [{ email: email?.toLowerCase() }, { phone: phone?.trim() }] });
      if (!user) return apiResponse.failure(res, "User not found, please register first", 404);
      if (user.status === ACCOUNT_STATUS.SUSPENDED) return apiResponse.failure(res, "Account suspended", 403);
      if (user.status === ACCOUNT_STATUS.DEACTIVATED) return apiResponse.failure(res, "Account deactivated", 403);
      const otp = email ? await redisClient.client.get(`otp:login:email:${email.toLowerCase()}`) : await redisClient.client.get(`otp:login:phone:${phone.trim()}`);
      if (!otp) return apiResponse.failure(res, "Login OTP expired or invalid, please generate OTP again", 400);
      if (otp !== code) return apiResponse.failure(res, "Login OTP invalid, please try again", 400);
      const updates = { lastSeenAt: new Date() };
      await User.updateOne({ _id: user._id }, { $set: updates });
      setAuthCookie(res, user._id, user.role);
      const userObject = user.toObject();
      delete userObject.password;
      userObject.lastSeenAt = updates.lastSeenAt;
      await redisClient.client.del(email ? `otp:login:email:${email.toLowerCase()}` : `otp:login:phone:${phone.trim()}`);
      return apiResponse.success(res, { user: userObject }, "Login successful", 200);
    } catch (err) {
      next(err)
    }
  },
  async googleCallback(req, res, next) {
    try {
      if (req.user) {
        // ✅ update lastSeenAt in DB
        await User.updateOne({ _id: req.user._id }, { $set: { lastSeenAt: new Date() } });

        // ✅ use setAuthCookie instead of manual jwt.sign
        setAuthCookie(res, req.user._id, req.user.role);

        return res.redirect(process.env.FRONTEND_URL);
      }

      const { googleId, email } = req.authInfo || {};
      if (!googleId) {
        return res.redirect(`${process.env.FRONTEND_URL}/?error=google_auth_failed`);
      }

      const tempToken = jwt.sign(
        { googleId, email, isTemp: true },
        process.env.JWT_SECRET,
        { expiresIn: "10m" }
      );
      return res.redirect(`${process.env.FRONTEND_URL}/complete-registration?tempToken=${encodeURIComponent(tempToken)}`);
    } catch (err) {
      next(err);
    }
  },

  async googleComplete(req, res, next) {
    try {
      const { tempToken, role } = req.body;
      const allowedRoles = ["gamer", "admin"];

      if (!allowedRoles.includes(role)) {
        return apiResponse.failure(res, "Invalid role", 400);
      }

      let decoded;
      try {
        decoded = verifyToken(tempToken);
      } catch (e) {
        return apiResponse.failure(res, "Invalid or expired token", 400);
      }

      if (!decoded.isTemp) {
        return apiResponse.failure(res, "Invalid token", 400);
      }

      const { googleId, email } = decoded;

      const existingUser = await User.findOne({
        $or: [
          { googleId },
          ...(email ? [{ email }] : []),
        ],
      });
      if (existingUser) {
        return apiResponse.failure(res, "User already exists", 400);
      }

      const user = await User.create({
        googleId,
        email,
        role,
        emailVerifiedAt: email ? new Date() : null,
      });
      await Profile.create({ user: user._id }).catch(() => {});
      setAuthCookie(res, user._id, user.role);
      return apiResponse.success(res, { user: user }, "Registration successful", 201);
    } catch (err) {
      next(err);
    }
  },

  async getMe(req, res, next) {
    try {
      const user = await User.findById(req.userId).select(
        "-password -googleId"
      );
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      return apiResponse.success(
        res,
        { user },
        "User loaded",
        200
      );
    } catch (err) {
      next(err);
    }
  },

  async session(req, res, next) {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).select("role status");
      if (!user) return apiResponse.failure(res, "User not found", 404);

      res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");

      return apiResponse.success(
        res,
        { role: user.role, status: user.status },
        "Session fetched successfully",
        200,
      );
    } catch (err) {
      next(err);
    }
  },

  async deleteAccount(req, res, next) {
    try {
      const user = await User.findById(req.userId).select("+password");
      if (!user) {
        return apiResponse.failure(res, "User not found", 404);
      }
      if (user.password) {
        const { password } = req.body;
        if (!password || !String(password).trim()) {
          return apiResponse.failure(
            res,
            "Password is required to delete your account",
            400
          );
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return apiResponse.failure(res, "Invalid password", 401);
        }
      }

      const listings = await Game.find({ seller: user._id }).lean();
      for (const listing of listings) {
        await deleteManyFromS3(collectImageKeys(listing.images));
      }
      await Game.deleteMany({ seller: user._id });

      const kyc = await KycDocument.findOne({ user: user._id }).lean();
      if (kyc?.profilePicture) {
        const key = keyFromLocationUrl(kyc.profilePicture);
        if (key) await deleteManyFromS3([key]);
      }
      await KycDocument.deleteMany({ user: user._id });
      await Profile.deleteMany({ user: user._id });
      await UserAchievement.deleteMany({ user: user._id });

      await User.deleteOne({ _id: user._id });
      clearAuthCookies(res);

      return apiResponse.success(
        res,
        { message: "Account deleted" },
        "Account deleted successfully",
        200
      );
    } catch (err) {
      next(err);
    }
  },

};

module.exports = authController;