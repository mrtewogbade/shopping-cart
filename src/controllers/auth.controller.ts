import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import catchAsync from "../errors/catchAsync";
import AppResponse from "../helpers/AppResponse";
import { Buyer, Seller, User } from "../models/user.model";
import AppError from "../errors/AppError";
import { IUser } from "../interfaces/IUser";


import {
  GenerateAccessToken,
  GenerateRefreshToken,
  GenerateTrackingToken,
} from "../helpers/GenerateToken";
import sendOtp from "../helpers/sendOtp";
import verifyOtp from "../helpers/verifyOtp";
import Otp from "../models/otp.model";
import { NODE_ENV, RefreshToken_Secret_Key } from "../serviceUrl";
import GenerateRandomId, {
  generateRandomAlphanumeric,
} from "../helpers/GenerateRandomId";
import SendMail from "../config/nodemailer.config";

//Only two not done are the createOtp and the verifyOtp

export const registerHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return next(new AppError("User already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    if (role == "seller") {
      user = new Seller({
        name,
        email,
        role,
        password: hashedPassword,
        store: undefined,
      });
    } else if (role == "buyer") {
      user = new Buyer({
        name,
        email,
        role,
        password: hashedPassword,
      });
    }

    if (user == undefined) {
      return next(
        new AppError("Users should either be buyers or sellers", 400)
      );
    }

    const firstName = name.split(" ")[0];
    const otpCode = generateRandomAlphanumeric();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mailOptions = {
      email,
      subject: "Verify Your Email Address",
      templateName: "verifyEmail",
      context: {
        name: firstName,
        otpCode,
      },
    };

    await user.save();

    const maxRetries = 3;
    let attempts = 0;
    let emailSent = false;

    while (attempts < maxRetries && !emailSent) {
      try {
        await SendMail(mailOptions);
        emailSent = true;
      } catch (error) {
        attempts++;
        console.error(`Attempt ${attempts} failed:`, error);
        if (attempts >= maxRetries) {
          console.log(`Failed to send email to ${email} after ${maxRetries} attempts.`);
        }
      }
    }


    const account = {
      name,
      email,
      role,
    };

    return AppResponse(
      res,
      "Registration successful, please check email to verify user.",
      201,
      account
    );
  }
);



export const fetchStorePinHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pinId = await Otp.find();
    
    return AppResponse(res, "Store ID fetch Successfully.", 201, pinId);
  }
);

export const verifyEmailHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body;
    const findUser: any = await User.findOne({ email });
    const userDate: any = findUser?.otpExpires;

    const dateToCheck = new Date(userDate);
    const now = new Date();

    // Calculate the date 24 hours ago
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    if (findUser.otp === otp) {
      if (findUser.isEmailVerified == true) {
        return next(
          new AppError("This user has already verified their account. ", 400)
        );
      }
      //This Checks if the otp was sent 24 hours ago
      if (dateToCheck < twentyFourHoursAgo) {
        return next(
          new AppError("This OTP has expired. Please request a new one. ", 400)
        );
      } else {
        findUser.isEmailVerified = true;
        findUser.otp = "";
        findUser.otpExpires = "";
        await findUser.save();
        return AppResponse(res, "User verification successful.", 200, null);
      }
    }
    return next(new AppError("This is an invalid OTP", 400));
  }
);


export const loginHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const isMobile = req.headers.mobilereqsender;

    const { phone_or_email, password } = req.body;
    // const user = await User.findOne({ email });
    const user:any = await User.findOne({
      $or: [{ email: phone_or_email }, { phone_number: phone_or_email }],
    });
    if (!user) return next(new AppError("User not found", 404));

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return next(new AppError("Invalid credentials", 401));
    if (!user.isEmailVerified)
      return next(new AppError("Please verify your email before log in.", 401));
    if (user.is_two_factor_enabled) {
      //We should send a token here to track that okay, this person has had their password stuff done
      const two_fa_track = {
        id: user._id,
        createdAt: Date.now(),
      };
      const two_fa_token = GenerateTrackingToken(two_fa_track);
      return AppResponse(
        res,
        "Please check your Authenticator app for your token.",
        200,
        two_fa_token
      );
    }
    const account = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      profile_image:user.imageUrl
    };
    
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    const accessToken: string | undefined = GenerateAccessToken(account);
    const refreshToken: string | undefined = GenerateRefreshToken(account);
    //If it is mobile we send token in response

    if (isMobile)
      return AppResponse(res, "Login successful", 200, {
        accessToken: accessToken,
        refreshToken: refreshToken,
        account,
      });
    
    res.cookie("e_access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
      priority: "high",
      signed: true,
      maxAge: 60 * 24 * 60 * 60 * 1000, 
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
    });

    res.cookie("e_refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      partitioned: true,
      signed: true,
      priority: "high",
      maxAge: 60 * 24 * 60 * 60 * 1000, 
      expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), 
    });


    return AppResponse(res, "Login successful", 200, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      account,
    });
  }
);


export const logOutHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    //If Web
    res.clearCookie("e_access_token");
    res.clearCookie("e_refresh_token");
    //If mobile, just tell them to delete on their storage
    //   await addTokenToBlacklist(token);
    return AppResponse(res, "User has Log out successfully", 200, null);
  }
);


//Completed
export const refreshAccessTokenHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
   
   
    if (!req.headers.authorization) {
      return next(new AppError("No authorization header provided", 401));
    }
    const refreshToken = req.headers.authorization.split(" ")[1];
    
    if (!refreshToken) return next(new AppError("No refresh token provided", 401));
    jwt.verify(
      refreshToken,
      RefreshToken_Secret_Key as string,
      async (err: any, decoded: any) => {
        if (err)
          return next(
            new AppError(
              "Incorrect or expired refresh token, please log in.",
              401
            )
          );

        const id = decoded.payload.id;
        const findUser = await User.findById(id).select("-password");

        if (!findUser)
          return next(
            new AppError(
              "Access token not created, only users can create them.",
              400
            )
          );
        const account = {
          id: findUser._id,
          name: findUser.name,
          email: findUser.email,
          role: findUser.role,
        };
        const accessToken: string | undefined = GenerateAccessToken(account);
       
        return AppResponse(res, "Token refreshed succesfully.", 200, {
          token: accessToken,
          account,
        });
      }
    );
  }
);

//Completed
export const GetTokenDetailsHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Logic for refreshing the access Token goes here
    const id = (req.user as IUser).id;
    const findUser = await User.findById(id);

    if (!findUser)
      return next(new AppError("Invalid user, please go off.", 400));
    const account = {
      id: findUser._id,
      name: findUser.name,
      email: findUser.email,
      role: findUser.role,
    };
    return AppResponse(res, "Successfully verified the token", 200, account);
  }
);

export const ChangePasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    const findUser = await User.findOne({ email });
    if (!findUser) return next(new AppError("User not found.", 404));
    if (!findUser.isEmailVerified)
      return next(
        new AppError(
          "This is an unverified email, please contact the admin.",
          404
        )
      );

    const firstName = findUser.name.split(" ")[0];
    const otpCode = generateRandomAlphanumeric();
    findUser.otp = otpCode;
    findUser.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    const mailOptions = {
      email,
      subject: "Confirm Your OTP",
      // The name of the Handlebars template file without the extension
      templateName: "resetPassword",
      context: {
        name: firstName,
        otpCode,
      },
    };
    await findUser.save();
    try {
      await SendMail(mailOptions);
    } catch (error) {
      console.error(error);
      console.log(`Error occured sending email to ${email}`);
    }
    return AppResponse(res, "An OTP has been sent to your email. ", 200, email);
  }
);



export const ResetPasswordOtpHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { otp, email } = req.body;
    const findUser: any = await User.findOne({ email });
    const userDate: any = findUser?.otpExpires;

    const dateToCheck = new Date(userDate);
    const now = new Date();

    // Calculate the date 24 hours ago
    const fiftyMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
    if (findUser.otp !== otp) {
      return next(new AppError("This is an invalid OTP", 400));
    }
    //This Checks if the otp was sent 24 hours ago
    if (dateToCheck < fiftyMinsAgo) {
      return next(
        new AppError("This OTP has expired. Please request a new one. ", 400)
      );
    } else {
      const token = GenerateTrackingToken({ email, id: findUser._id });
      findUser.otp = "";
      findUser.otpExpires = "";
      await findUser.save();
      return AppResponse(res, "You can now reset your password.", 200, {
        token,
      });
    }
  }
);

export const ResetPasswordHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { password } = req.body;
    // const id = req.user?.id;
    const id = (req.user as IUser).id;

    const updatedUser: any = await User.findByIdAndUpdate(
      id,
      { $set: { password: password } },
      { new: true }
    );
    if (!updatedUser)
      return next(new AppError("This user does not exist", 404));
    return AppResponse(
      res,
      "You have succesfully reset your password.",
      200,
      null
    );
  }
);

export const GoogleOauthLoginHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user: any = req.user;

    if (user?.status === "fail") {
      return next(new AppError("This user does not exist", 404));
    }
    const account = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const accessToken: string | undefined = GenerateAccessToken(account);
    const refreshToken: string | undefined = GenerateRefreshToken(account);
    //If it is mobile we send token in response

    return AppResponse(res, "Login successful", 200, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      account,
    });
  }
);

export const GoogleOauthRegisterHandler = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const profile: any = req.user;
    const role: string = req.body.role;
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      return next(new AppError("User already exists", 400));
    }

    if (role == "seller") {
      user = new Seller({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role,

        store: undefined,
      });
    } else if (role == "buyer") {
      user = new Buyer({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        role,
      });
    }
    if (user == undefined)
      return next(
        new AppError("Users should either be buyers or sellers", 400)
      );

    const firstName = profile.displayName.split(" ")[0];
    const otpCode = generateRandomAlphanumeric();
    user.otp = otpCode;
    user.otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mailOptions = {
      email: profile.emails[0].value,
      subject: "Verify Your Email Address",
      // The name of the Handlebars template file without the extension
      templateName: "verifyEmail",
      context: {
        name: firstName,
        otpCode,
      },
    };
    await user.save();
    try {
      await SendMail(mailOptions);
    } catch (error) {
      console.error(error);
      console.log(`Error occured sending email to ${user.email}`);
    }
    const account = {
      name: user.name,
      email: user.email,
      role: role,
    };
    //Email will be sent to the user
    return AppResponse(
      res,
      " Registration successfull, please check email to verify user.",
      201,
      account
    );
  }
);
