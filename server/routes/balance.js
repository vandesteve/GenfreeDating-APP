app.get('/api/profile/:user_id/balance', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(
          CASE 
            WHEN transaction_type IN ('DEPOSIT','REFUND') THEN amount
            ELSE -amount
          END
        ), 0) AS available_balance
      FROM wallet_transactions
      WHERE user_id = $1
    `, [user_id]);
    res.json({ balance: result.rows[0].available_balance });
  } catch (err) {
    console.error('Error fetching balance:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/profile/:user_id/transactions', async (req, res) => {
  const { user_id } = req.params;
  try {
    const result = await pool.query(`
      SELECT id, transaction_type, amount, description, created_at
      FROM wallet_transactions
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [user_id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

