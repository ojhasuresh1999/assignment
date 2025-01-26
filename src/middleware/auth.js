import jwt from "jsonwebtoken";
import responseSend from "../utils/sendResponse.js";

export default async function auth(req, res, next) {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({ error: "You must be logged in" });
    }
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (error) {
    return responseSend(res, 401, "You must be logged in", null);
  }
}
