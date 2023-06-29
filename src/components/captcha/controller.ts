import { Request, Response } from 'express';

export const captcha = async (req: Request, res: Response) => {
  const verifyEndpoint = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
  const secret = "0x4AAAAAAAGq7DcT6jY_ClwkpwaBvrJ2pr8";

  const token = req.body.token;

  const response = await fetch(verifyEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      secret,
      response: token
    })
  });

  const data = await response.json();

  return res.status(200).json(data);
}