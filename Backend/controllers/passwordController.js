const crypto = require('crypto');
const bcrypt = require('bcrypt');
const loginModel = require('../models/loginModel');
const { sendResetEmail } = require('../utils/email');

const RESET_EXPIRE_HOURS = Number(process.env.PASSWORD_RESET_HOURS || 2);

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Correo requerido.' });

    // generate token regardless of whether user exists (avoid enumeration)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_EXPIRE_HOURS * 3600 * 1000);

    // try to set in DB only if user exists
    const user = await new Promise((r) =>
      loginModel.fetchUserByEmail(email).then(r).catch(() => r(null))
    );

    if (user && user.email) {
      await loginModel.setPasswordResetForEmail(user.email, token, expiresAt);
      try {
        await sendResetEmail(user.email, token);
      } catch (e) {
        console.error('sendResetEmail error', e);
      }
    }

    // Always return generic success
    res.json({ message: 'Si existe una cuenta con ese correo, recibirás un email con instrucciones.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token y contraseña requeridos.' });

    const user = await loginModel.findByPasswordResetToken(token);
    if (!user) return res.status(400).json({ error: 'Token inválido o expirado.' });
    if (!user.password_reset_expires || new Date(user.password_reset_expires) < new Date()) {
      return res.status(400).json({ error: 'Token inválido o expirado.' });
    }

    // validate password server-side (same rules as frontend)
    if (typeof password !== 'string' || password.length < 8 || password.length > 64 ||
        !/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      return res.status(400).json({ error: 'Contraseña no cumple requisitos.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await loginModel.updatePasswordByEmail(user.email, hashed);

    res.json({ message: 'Contraseña actualizada.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};