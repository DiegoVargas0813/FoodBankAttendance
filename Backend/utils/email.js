const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    }
});

exports.sendConfirmationEmail = (to, token) => {
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject : 'Confirma tu correo electronico en BAMX',
        html: `<p>Haz clic en el siguiente enlace para confirmar tu correo:</p>
           <a href="${confirmUrl}">${confirmUrl}</a>`,
    };
    return transporter.sendMail(mailOptions);
};