import { authenticator } from 'otplib';

export const generateSecret = () => {
  return authenticator.generateSecret();
};

export const generate = (secretKey: string) => {
  return authenticator.generate(secretKey);
};

export const verifyOtp = (otp: string, secret: string) => {
  return authenticator.check(otp, secret);
};

export const generateKeyUri = (username: string, secret: string) => {
  return authenticator.keyuri(username, "Laboratorio 14", secret);
}