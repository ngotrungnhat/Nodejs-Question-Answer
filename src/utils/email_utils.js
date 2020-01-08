import nodemailer from "nodemailer"
import config from "../utils/config"

class EmailUtils {

    static async sendOneMail(receiver, email) {
        const { username, password } = config.email_sender

        const transporter = this.getTransport(username, password)
        const mailOption = this.getMailOption(receiver, email)

        const info = await transporter.sendMail(mailOption).catch(error => {
          console.error(error);
        });
    
        console.log(info)
    }

    static getTransport(username, password) {
        const transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: username,
                pass: password
            }
        })

        return transport
    }

    static getMailOption(receiver, email) {
        const { subject, content, attachments } = email

        const mailOption = {
            to: receiver,
            subject: subject,
            text: content,
            attachments: attachments
        }

        return mailOption
    }
}

export default EmailUtils