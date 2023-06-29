import Mailgun from "mailgun.js";
import FormData from "form-data";

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: process.env["MAILGUN_API_KEY"] || ""
});

console.log(process.env["MAILGUN_API_KEY"]);

const sendEmail = async (to: string, subject: string, text: string) => {
  const response = await mg.messages.create('sandboxc4c08a56b91341c59b30741127ada808.mailgun.org', {
    from: "Laboratorio 14 <mailgun@sandboxc4c08a56b91341c59b30741127ada808.mailgun.org>",
    to: [to],
    subject: subject,
    text: text
  });

  return response.status === 200 ? true : false;
}

export default sendEmail;