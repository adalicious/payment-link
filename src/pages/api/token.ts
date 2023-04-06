import { NextApiRequest, NextApiResponse } from "next";
import { create } from "njwt";

/**
 * This method is called from the link builder form for generating a signed token with the jwt secret provided
 * @param req
 * @param res
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // @TODO: Handle errors properly

  const claims = { pid: req.body.pid, products: req.body.products };

  const token = create(claims, req.body.jwt);

  // Sets the token expiration to one hour
  token.setExpiration(new Date().getTime() + 60 * 60 * 1000);

  const value = token.compact();

  res.status(200).json({ token: value });
}
