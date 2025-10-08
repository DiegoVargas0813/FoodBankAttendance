const userModel = require('../models/userModel');

// Ejemplo de ruta protegida
//Esta ruta se accede por cualquier usuario autenticado
exports.getUserByIdProtected = async (req, res) => {
    try {
        const user = await userModel.fetchUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Ejemplo de ruta protegida + control de rol
//Esta ruta solo se accede por usuarios con rol 'admin'
exports.getUserByIdAdminOnly = async (req, res) => {
    try {
        const user = await userModel.fetchUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// TODO: Remover una vez se hayan implementado todas las rutas protegidas y con control de rol
// Ruta desprotegida
// Esta ruta se accede por cualquier usuario, autenticado o no. Usada principalmente para login o registro.
exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.fetchUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

