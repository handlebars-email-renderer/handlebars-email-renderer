// Import Modules
const { createTransport } = require("nodemailer");
const HandlebarsEmailRenderer = require("handlebars-email-renderer");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();
const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_FROM, MAIL_PASSWORD, MAIL_TO } = process.env;

// Create reusable transporter object using the default SMTP transport
const transporter = createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    secure: MAIL_SECURE,
    auth: {
        user: MAIL_FROM,
        pass: MAIL_PASSWORD,
    },
});

// Mail options
const mailOptions = {
    priority: "high",
    from: `TEST <${MAIL_FROM}>`,
    to: MAIL_TO,
    subject: "Test 🧪",
    text: "Display text if there is no HTML code or if there is an error with it",
};

// Function to send the email asynchronously
async function sendMail() {
    mailOptions.html = await new HandlebarsEmailRenderer({ viewsPath: './exemples/views' }).render("welcome", {
        username: "username_passed_to_template",
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else if (info) {
            console.info("Async mail sent");
        }
    });
}

// Send the email synchronously
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        console.error(error);
    } else if (info) {
        console.info("Sync mail sent");
    }
});

// Call the asynchronous send mail function
sendMail();
