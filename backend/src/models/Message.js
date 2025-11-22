const db = require('../config/database');

class Message {
  static async create(messageData) {
    const { classroom_id, user_id, message } = messageData;
    
    const query = `
      INSERT INTO messages (classroom_id, user_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const values = [classroom_id, user_id, message];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByClassroom(classroomId, page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT m.*, 
             u.full_name as user_name,
             u.user_id,
             COALESCE(ml.likes_count, 0) as likes_count
      FROM messages m
      JOIN users u ON m.user_id = u.user_id
      LEFT JOIN (
        SELECT message_id, COUNT(*) as likes_count
        FROM message_likes
        GROUP BY message_id
      ) ml ON m.id = ml.message_id
      WHERE m.classroom_id = $1
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    
    const { rows } = await db.query(query, [classroomId, limit, offset]);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT m.*, 
             u.full_name as user_name,
             u.user_id,
             COALESCE(ml.likes_count, 0) as likes_count
      FROM messages m
      JOIN users u ON m.user_id = u.user_id
      LEFT JOIN (
        SELECT message_id, COUNT(*) as likes_count
        FROM message_likes
        GROUP BY message_id
      ) ml ON m.id = ml.message_id
      WHERE m.id = $1
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async delete(id, userId) {
    // Only allow users to delete their own messages
    const query = `
      DELETE FROM messages 
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [id, userId]);
    return rows[0];
  }

  static async likeMessage(messageId, userId) {
    const query = `
      INSERT INTO message_likes (message_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (message_id, user_id) DO NOTHING
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [messageId, userId]);
    return rows[0];
  }

  static async unlikeMessage(messageId, userId) {
    const query = `
      DELETE FROM message_likes 
      WHERE message_id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [messageId, userId]);
    return rows[0];
  }

  static async isMessageLiked(messageId, userId) {
    const query = `
      SELECT * FROM message_likes 
      WHERE message_id = $1 AND user_id = $2
    `;
    
    const { rows } = await db.query(query, [messageId, userId]);
    return rows.length > 0;
  }
}

module.exports = Message;
