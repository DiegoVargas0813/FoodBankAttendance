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
    const confirmUrl = `${process.env.FRONTEND_URL}/confirm/${encodeURIComponent(token)}`;

    // primary color derived from HSL(144 100% 29%) => approx #00943B
    const primaryHex = '#00943B';
    const foreground = '#FFFFFF';
    const contactEmail = 'comunicacionbamx@bdalimentos.org';

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body style="margin:0;font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background:#f4f6f8;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px 12px;">
              <table role="presentation" width="600" style="max-width:600px;border-radius:8px;overflow:hidden;background:#ffffff;" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${primaryHex};padding:20px 24px;text-align:center;color:${foreground};">
                    <h1 style="margin:0;font-size:20px;">Banco de Alimentos BAMX</h1>
                  </td>
                </tr>

                <tr>
                  <td style="padding:28px 24px;color:#111827;">
                    <p style="margin:0 0 12px 0;">Hola,</p>
                    <p style="margin:0 0 18px 0;">
                      Gracias por registrarte en BAMX. Para completar la creación de tu cuenta, por favor confirma tu correo haciendo clic en el botón de abajo:
                    </p>

                    <div style="text-align:center;margin:22px 0;">
                      <a href="${confirmUrl}" target="_blank"
                         style="background:${primaryHex};color:${foreground};padding:12px 20px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;">
                        Confirmar correo
                      </a>
                    </div>

                    <p style="margin:0 0 8px 0;color:#6b7280;font-size:13px;">
                      Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:
                    </p>
                    <p style="word-break:break-all;font-size:13px;color:#374151;"><a href="${confirmUrl}" style="color:${primaryHex};text-decoration:underline;">${confirmUrl}</a></p>

                    <hr style="border:none;border-top:1px solid #eef2f6;margin:20px 0;" />

                    <p style="margin:0;font-size:13px;color:#6b7280;">
                      Si no has solicitado este correo puedes ignorarlo.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="background:#f9fafb;padding:16px 24px;text-align:center;color:#6b7280;font-size:13px;">
                    <div>Hacienda de la Calerilla 360, Santa Maria Tequepexpan, Tlaquepaque, Jalisco.</div>
                    <div style="margin-top:6px;">GDL : 33 3810 6595</div>
                    <div style="margin-top:6px;"><a href="mailto:${contactEmail}" style="color:${primaryHex};text-decoration:none;">${contactEmail}</a></div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const text = `Confirma tu correo en BAMX:\n\n${confirmUrl}\n\nSi no solicitaste esto, ignora este mensaje.`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject : 'Confirma tu correo electrónico en BAMX',
        text,
        html,
    };

    return transporter.sendMail(mailOptions);
};


exports.sendInviteEmail = async (to, token, role = 'ADMIN') => {
  const acceptUrl = `${process.env.FRONTEND_URL}/accept-invite?token=${encodeURIComponent(token)}`;
  const primaryHex = '#00943B';
  const foreground = '#ffffff';
  const contactEmail = 'comunicacionbamx@bdalimentos.org';

  const html = `
  <!doctype html>
  <html>
  <body style="margin:0;font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Arial;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr><td align="center" style="padding:24px 12px">
        <table width="600" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden" cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:${primaryHex};padding:18px 24px;color:${foreground};text-align:center">
              <h2 style="margin:0">Invitación — Banco de Alimentos BAMX</h2>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#111827">
              <p>Has sido invitado a unirte a BAMX con el rol <strong>${role}</strong>.</p>
              <p>Para crear tu cuenta sigue el siguiente enlace (expira según lo indicado en la invitación):</p>
              <div style="text-align:center;margin:18px 0">
                <a href="${acceptUrl}" style="background:${primaryHex};color:${foreground};padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600;">Aceptar invitación</a>
              </div>
              <p style="font-size:13px;color:#6b7280">Si no esperabas esta invitación, ignora este correo.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:14px 18px;text-align:center;color:#6b7280;font-size:13px">
              <div>Hacienda de la Calerilla 360, Santa Maria Tequepexpan, Tlaquepaque, Jalisco.</div>
              <div style="margin-top:6px">GDL : 33 3810 6595</div>
              <div style="margin-top:6px"><a href="mailto:${contactEmail}" style="color:${primaryHex};text-decoration:none">${contactEmail}</a></div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;

  const text = `Has sido invitado a BAMX. Abre el enlace para aceptar: ${acceptUrl}`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Invitación para unirse a BAMX',
    text,
    html,
  });
};

// Reset email function (used in passwordController)
exports.sendResetEmail = async (to, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
  const primaryHex = '#00943B';
  const foreground = '#ffffff';
  const contactEmail = 'comunicacionbamx@bdalimentos.org';

  const html = `
    <!doctype html><html><body style="font-family:system-ui, -apple-system, 'Segoe UI', Roboto, Arial;">
      <table width="100%"><tr><td align="center" style="padding:24px">
        <table width="600" style="max-width:600px;background:#fff;border-radius:8px;overflow:hidden">
          <tr><td style="background:${primaryHex};color:${foreground};padding:16px;text-align:center"><h2 style="margin:0">Restablecer contraseña — BAMX</h2></td></tr>
          <tr><td style="padding:20px;color:#111827">
            <p>Recibimos una solicitud para restablecer la contraseña.</p>
            <div style="text-align:center;margin:18px 0">
              <a href="${resetUrl}" style="background:${primaryHex};color:${foreground};padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:600">Restablecer contraseña</a>
            </div>
            <p style="font-size:13px;color:#6b7280">Si no solicitaste esto, ignora este correo.</p>
            <p style="font-size:12px;color:#6b7280;word-break:break-all"><a href="${resetUrl}" style="color:${primaryHex};text-decoration:underline">${resetUrl}</a></p>
          </td></tr>
          <tr><td style="background:#f9fafb;padding:12px;text-align:center;color:#6b7280;font-size:13px">
            <div>Hacienda de la Calerilla 360, Santa Maria Tequepexpan, Tlaquepaque, Jalisco.</div>
            <div>GDL : 33 3810 6595</div>
            <div><a href="mailto:${contactEmail}" style="color:${primaryHex};text-decoration:none">${contactEmail}</a></div>
          </td></tr>
        </table>
      </td></tr></table>
    </body></html>`;

  const text = `Restablece tu contraseña: ${resetUrl}`;

  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Restablece tu contraseña — BAMX',
    text,
    html,
  });
};