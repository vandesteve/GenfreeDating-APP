module.exports = (app, pool) => {
  // 🟢 Get all active dating categories
  app.get('/api/categories', async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, description, gender_restriction, allow_login, is_active
        FROM dating_categories
        WHERE is_active = TRUE
        ORDER BY name
      `);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching categories:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // 🟢 Get all user’s active categories (optional for testing)
  app.get('/api/user/:user_id/categories', async (req, res) => {
    const { user_id } = req.params;
    try {
      const result = await pool.query(`
        SELECT uc.id, dc.name, dc.gender_restriction, uc.is_active
        FROM user_categories uc
        JOIN dating_categories dc ON dc.id = uc.category_id
        WHERE uc.user_id = $1 AND uc.is_active = TRUE
      `, [user_id]);
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching user categories:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};