import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import config from "../config/config.js";

const createToken = (payload: string): string => {
  return jwt.sign({ userId: payload }, config.JWT_SECRET_KEY, {
    expiresIn: config.JWT_EXPIRE_TIME as NonNullable<SignOptions["expiresIn"]>,
  });
};

interface TokenPayload extends JwtPayload {
  userId: string;
}

export const verifyToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, config.JWT_SECRET_KEY);

  if (typeof decoded === "string" || typeof decoded.userId !== "string") {
    throw new Error("Invalid token payload");
  }

  return decoded as TokenPayload;
};

export default createToken;
