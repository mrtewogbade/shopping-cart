"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const serviceUrl_1 = require("../serviceUrl");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    secure: false,
    auth: { user: serviceUrl_1.GOOGLE_ADDRESS, pass: serviceUrl_1.GOOGLE_PASS },
});
const loadTemplate = (templateName, context) => {
    const templatePath = path_1.default.resolve(`./src/views/${templateName}.handlebars`);
    const templateSource = fs_1.default.readFileSync(templatePath, "utf-8");
    const compiledTemplate = handlebars_1.default.compile(templateSource);
    return compiledTemplate(context);
};
const sendMail = async (options) => {
    const html = loadTemplate(options.templateName, options.context);
    const mailOptions = {
        from: serviceUrl_1.GOOGLE_ADDRESS,
        to: options.email,
        subject: options.subject,
        html,
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email: ", error);
        }
        else {
            console.log("Email sent: ", info.response);
        }
    });
};
exports.default = sendMail;
