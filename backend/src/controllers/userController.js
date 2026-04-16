const db = require('../config/db');

exports.getProfile = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const [rows] = await db.query('SELECT id, name, email, timezone, created_at FROM users WHERE id = ?', [userId]);
    
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
    
    res.json(rows[0]);
};

exports.updateProfile = async (req, res) => {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'x-user-id header required' });

    const { name, timezone } = req.body;
    
    const [result] = await db.query('UPDATE users SET name = ?, timezone = ? WHERE id = ?', [name, timezone, userId]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'Profile updated successfully' });
};
