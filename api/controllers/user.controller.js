import jwt from "jsonwebtoken";

export async function getUserData(req) {
  const token = req.cookies?.token;
  let data;

  if (token) {
    jwt.verify(token, process.env.JWT_KEY, {}, (err, decoded) => {
      if (err) return;
      data = decoded;
    });
  }

  return data;
}
