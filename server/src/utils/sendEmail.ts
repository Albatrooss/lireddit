import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, html: string) => {
    let testAccount = {
        user: 'gmzixbj4qtctbgzy@ethereal.email',
        pass: 'x9aS5dVx4P3WKEFMxu',
    }

    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        },
    });

    console.log('html:', html)

    const info = await transporter.sendMail({
        from: '"Fred Foo" <foo@example.ca',
        to: to,
        subject: 'Change Password',
        html
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}