import nodemailer from "nodemailer";
import handlebars from "handlebars";
import fs from "fs";
import path from "path";
import { GOOGLE_PASS, GOOGLE_ADDRESS } from "../serviceUrl";

interface IEmailOptions {
  email: string;
  subject: string;
  templateName: string;
  context: any;
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: false, 
  auth: { user: GOOGLE_ADDRESS, pass: GOOGLE_PASS },
});

const loadTemplate = (templateName: string, context: any): string => {
  const templatePath = path.resolve(`./src/views/${templateName}.handlebars`);
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateSource);
  return compiledTemplate(context);
};

const sendMail = async (options: IEmailOptions) => {
  const html = loadTemplate(options.templateName, options.context);

  const mailOptions = {
    from: GOOGLE_ADDRESS,
    to: options.email,
    subject: options.subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email: ", error);
    } else {
      console.log("Email sent: ", info.response);
    }
  });

};

export default sendMail;
