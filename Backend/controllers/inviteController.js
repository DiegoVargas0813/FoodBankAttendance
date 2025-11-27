const inviteModel = require('../models/inviteModel');
const db = require('../connection');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { sendInviteEmail } = require('../utils/email');
const familyModel = require('../models/familyModel');

const INVITE_DEFAULT_HOURS = 72;
const ALLOWED_ROLES = ['ADMIN', 'VOLUNTEER', 'DRIVER', 'FAMILY'];

const isValidEmail = (email) =>
  typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const passwordRules = (pw) => {
  if (!pw) return 'La contraseña es obligatoria.';
  if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (pw.length > 64) return 'La contraseña debe tener como máximo 64 caracteres.';
  if (!/[A-Za-z]/.test(pw)) return 'La contraseña debe incluir al menos una letra.';
  if (!/[0-9]/.test(pw)) return 'La contraseña debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'La contraseña debe incluir al menos un símbolo (ej. !@#$%).';
  return null;
};

exports.createInvite = async (req, res) => {
  try {
    const inviterId = req.user?.id || req.user?.idusers || null;
    const { email, role = 'ADMIN', hours = INVITE_DEFAULT_HOURS } = req.body;

    if (!email) return res.status(400).json({ error: 'Se requiere correo electrónico.' });
    if (!isValidEmail(String(email).trim())) return res.status(400).json({ error: 'Correo inválido.' });

    const normalizedRole = String(role || 'ADMIN').toUpperCase();
    if (!ALLOWED_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: 'Rol no permitido.' });
    }

    const hoursNum = Number(hours);
    if (!Number.isFinite(hoursNum) || hoursNum <= 0 || hoursNum > 168) {
      return res.status(400).json({ error: 'Duración inválida para la invitación.' });
    }

    // create token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + hoursNum * 3600 * 1000);

    await inviteModel.createInvite({
      email: String(email).trim().toLowerCase(),
      role: normalizedRole,
      token,
      expiresAt,
      invited_by: inviterId,
    });

    // send invite email
    try {
      await sendInviteEmail(email, token, normalizedRole);
    } catch (e) {
      console.error('sendInviteEmail error', e);
      // invitation created even if email fails — still return success but warn
      return res.status(201).json({ message: 'Invitación creada, pero fallo el envío de correo.', email, token });
    }

    res.status(201).json({ message: 'Invitación creada.', email });
  } catch (err) {
    console.error('createInvite error', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.listInvites = async (req, res) => {
  try {
    const rows = await inviteModel.listInvites();
    res.json({ invites: rows });
  } catch (err) {
    console.error('listInvites error', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.resendInvite = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Token inválido.' });

    const invite = await inviteModel.findByToken(token);
    if (!invite) return res.status(404).json({ error: 'Invitación no encontrada.' });
    if (invite.used) return res.status(400).json({ error: 'Invitación ya usada o cancelada.' });

    // extend expiration and resend
    const newExpires = new Date(Date.now() + INVITE_DEFAULT_HOURS * 3600 * 1000);
    await inviteModel.extendInvite(token, newExpires);

    await sendInviteEmail(invite.email, token, invite.role);
    res.json({ message: 'Invitación reenviada.' });
  } catch (err) {
    console.error('resendInvite error', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.cancelInvite = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || typeof token !== 'string') return res.status(400).json({ error: 'Token inválido.' });

    const invite = await inviteModel.findByToken(token);
    if (!invite) return res.status(404).json({ error: 'Invitación no encontrada.' });
    await inviteModel.cancelInvite(token);
    res.json({ message: 'Invitación cancelada.' });
  } catch (err) {
    console.error('cancelInvite error', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// public endpoint: accept an invite and create a user (safe, uses token)
exports.acceptInvite = async (req, res) => {
  try {
    const { token, username, password } = req.body;
    if (!token || !username || !password) return res.status(400).json({ error: 'Token, nombre y contraseña son obligatorios.' });

    const uname = String(username).trim();
    if (uname.length < 3 || uname.length > 60) return res.status(400).json({ error: 'El nombre debe tener entre 3 y 60 caracteres.' });

    const pwErr = passwordRules(String(password));
    if (pwErr) return res.status(400).json({ error: pwErr });

    const invite = await inviteModel.findByToken(String(token));
    if (!invite) return res.status(400).json({ error: 'Token de invitación inválido.' });
    if (invite.used) return res.status(400).json({ error: 'La invitación ya fue usada o cancelada.' });
    if (new Date(invite.expires_at) < new Date()) return res.status(400).json({ error: 'La invitación expiró.' });

    // check if user with email already exists
    const [existing] = await new Promise((resolve) => {
      db.query('SELECT idusers FROM users WHERE email = ? LIMIT 1', [invite.email], (err, rows) => {
        if (err) return resolve([null]);
        resolve(rows || []);
      });
    });
    if (existing && existing.idusers) {
      return res.status(400).json({ error: 'Ya existe un usuario con ese correo.' });
    }

    // hash password and insert user (confirmed)
    const hashed = await bcrypt.hash(password, 10);
    const insertSql = `INSERT INTO users (email, password, username, role, is_confirmed, confirmation_token, token_version, created_at) VALUES (?, ?, ?, ?, 1, NULL, 0, NOW())`;
    const newUser = await new Promise((resolve, reject) => {
      db.query(insertSql, [invite.email, hashed, uname, invite.role], (err, result) => {
        if (err) return reject(err);
        resolve({ id: result.insertId });
      });
    });

    // if family role, create family record (use existing model or direct insert)
    if (String(invite.role).toUpperCase() === 'FAMILY') {
      try {
        if (typeof familyModel.createFamilyForUser === 'function') {
          await familyModel.createFamilyForUser(newUser.id);
        } else {
          await new Promise((resolve, reject) => {
            db.query('INSERT INTO families (idusers, status, form_data) VALUES (?, "approved", NULL)', [newUser.id], (err) => {
              if (err) return reject(err);
              resolve();
            });
          });
        }
      } catch (e) {
        console.error('create family error', e);
      }
    }

    // mark invite used
    await inviteModel.markUsed(String(token));

    res.status(201).json({ message: 'Cuenta creada.', email: invite.email, id: newUser.id });
  } catch (err) {
    console.error('acceptInvite error', err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};