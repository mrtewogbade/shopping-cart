import jwt from "jsonwebtoken";
import AppError from "../errors/AppError";
import {
  AccessToken_Secret_Key,
  RefreshToken_Secret_Key,
  Tracking_Token_Secret_Key,
} from "../serviceUrl";
export const GenerateAccessToken = (payload: any) => {
  if (!payload) {
    throw new Error("Payload not provided");
    return;
  }
  if (!AccessToken_Secret_Key) {
    throw new Error("Access token secret key not provided");
    return;
  }

  const token = jwt.sign({ payload }, AccessToken_Secret_Key, {
    expiresIn: "60d",
  });
  return token;
};

export const GenerateRefreshToken = (payload: any) => {
  if (!payload) {
    throw new Error("Payload not provided");
    return;
  }
  if (!RefreshToken_Secret_Key) {
    throw new Error("Refresh token secret key not provided");
    return;
  }

  const token = jwt.sign({ payload }, RefreshToken_Secret_Key, {
    expiresIn: "60d",
  });
  return token;
};

export const GenerateTrackingToken = (payload: any) => {
  if (!payload) {
    throw new Error("Payload not provided");
    return;
  }
  if (!Tracking_Token_Secret_Key) {
    throw new Error("Tracking token secret key not provided");
    return;
  }

  const token = jwt.sign({ payload }, Tracking_Token_Secret_Key, {
    expiresIn: "15m",
  });
  return token;
};
