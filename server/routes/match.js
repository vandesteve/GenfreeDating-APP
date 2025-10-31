module.exports = (app, pool) => {
  app.get('/api/match/:category_name', async (req, res) => {
    const { category_name } = req.params;
    const user_id = req.query.user_id;

    try {
      if (!user_id) {
        return res.status(401).json({ status: 'NOT_LOGGED_IN', message: 'Please log in to continue.' });
      }

      const catResult = await pool.query(
        `SELECT id, name, is_free, package_amount, duration, is_active 
         FROM dating_categories 
         WHERE LOWER(name) = LOWER($1) AND is_active = TRUE`,
        [category_name]
      );

      if (catResult.rowCount === 0) {
        return res.status(404).json({ status: 'CATEGORY_NOT_FOUND', message: 'This category is not available.' });
      }

      const category = catResult.rows[0];

      // Log category for debugging
      console.log('Category:', category);

      // Fetch profiles for users subscribed to this category
      const profiles = await pool.query(`
        SELECT u.id, u.username, us.gender, us.sexual_pref AS preference, us.biography AS bio, 
               up.picture_data AS profile_picture, us.user_location, us.age, us.fame_rating
        FROM users u
        INNER JOIN user_categories uc ON u.id = uc.user_id
        INNER JOIN user_settings us ON u.id = us.user_id
        LEFT JOIN user_pictures up ON u.id = up.user_id AND up.profile_pic = 'YES'
        WHERE u.id <> $1
        AND us.gender IS NOT NULL
        AND uc.category_id = $2
        AND uc.is_active = TRUE
        LIMIT 50;
      `, [user_id, category.id]);

      // Log query result
      console.log('Profiles found:', profiles.rows.length);

      if (category.is_free) {
        return res.json({
          status: 'FREE_CATEGORY_ACCESS_GRANTED',
          message: `You have access to the free category: ${category.name}`,
          category,
          profiles: profiles.rows,
        });
      }

      // Check if the current user is subscribed
      const subResult = await pool.query(
        `SELECT id, is_active, created_at 
         FROM user_categories 
         WHERE user_id = $1 AND category_id = $2`,
        [user_id, category.id]
      );

      let subscriptionActive = false;

      if (subResult.rowCount > 0) {
        const sub = subResult.rows[0];
        const expiryCheck = await pool.query(
          `SELECT (created_at + $1::interval) > NOW() AS still_valid 
           FROM user_categories 
           WHERE id = $2`,
          [category.duration, sub.id]
        );

        const stillValid = expiryCheck.rows[0].still_valid;

        if (sub.is_active && stillValid) {
          subscriptionActive = true;
        } else {
          return res.json({
            status: 'EXPIRED',
            message: 'Your subscription for this category has expired. Would you like to renew?',
          });
        }
      }

      if (!subscriptionActive) {
        const walletResult = await pool.query(`
          SELECT 
            COALESCE(SUM(
              CASE 
                WHEN transaction_type = 'DEPOSIT' THEN amount
                WHEN transaction_type IN ('TIP', 'PAY') THEN -amount
                ELSE 0
              END
            ), 0) AS balance
          FROM wallet_transactions
          WHERE user_id = $1;
        `, [user_id]);

        const balance = parseFloat(walletResult.rows[0].balance) || 0;

        if (balance < parseFloat(category.package_amount)) {
          return res.json({
            status: 'INSUFFICIENT_FUNDS',
            message: `Your balance is ${balance}. Please deposit at least ${category.package_amount} to access this category.`,
          });
        } else {
          return res.json({
            status: 'NOT_SUBSCRIBED',
            message: `You are not subscribed to this category. Would you like to subscribe using ${category.package_amount}?`,
            balance,
            category,
          });
        }
      }

      return res.json({
        status: 'ACCESS_GRANTED',
        message: `Access granted for ${category.name}`,
        category,
        profiles: profiles.rows,
      });
    } catch (err) {
      console.error('Error in /api/match/:category_name:', err.message, err.stack);
      res.status(500).json({ status: 'ERROR', message: 'Internal server error', error: err.message });
    }
  });
};