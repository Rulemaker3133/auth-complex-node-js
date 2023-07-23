const nodemailer = require('nodemailer')

class MailService {
    constructor() { // Initialising mail client
        this.transporter = nodemailer.createTransport({ // Using all data from test email, stored in .env
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_USER_PASSWORD
            }
        })
    }
    async sendActivationLetter(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER, // Sending letter from testing email
            to,
            subject: `Activate yout account on ${process.env.API_URL}`, // Webpage URL
            text: '',
            html: 
                `
                    <div>
                        <h1>For activation please go through hyperlink</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        })
        
    }
}

module.exports = new MailService();