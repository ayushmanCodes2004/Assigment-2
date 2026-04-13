const { pgPool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(email, password) {
    const hashedPassword = await bcrypt.hash(password, 12);
    const query = `
      INSERT INTO users (email, password, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, email, created_at
    `;
    const result = await pgPool.query(query, [email, hashedPassword]);
    return result.rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pgPool.query(query, [email]);
    return result.rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, email, created_at FROM users WHERE id = $1';
    const result = await pgPool.query(query, [id]);
    return result.rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;