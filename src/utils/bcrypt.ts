import { compare, genSalt, hash } from "bcrypt";

export const hashPassword = async (password: string) => {
  const salt = await genSalt(10);
  const hashedPassword = await hash(password, salt);

  return hashedPassword;
}

export const comparePassword = async (password: string, hashedPassword: string) => {
  const isPasswordCorrect = await compare(password, hashedPassword);

  return isPasswordCorrect;
}