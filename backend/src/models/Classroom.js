const db = require('../config/database');

class Classroom {
  static async create(classroomData) {
    const { name, code, description, instructor } = classroomData;
    
    const query = `
      INSERT INTO classrooms (name, code, description, instructor)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const values = [name, code, description, instructor];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findAll() {
    const query = `
      SELECT c.*, 
             COUNT(DISTINCT cm.user_id) as members_count,
             COUNT(DISTINCT i.item_id) as items_count
      FROM classrooms c
      LEFT JOIN classroom_memberships cm ON c.id = cm.classroom_id
      LEFT JOIN items i ON i.owner_id = cm.user_id
      GROUP BY c.id, c.name, c.code, c.description, c.instructor, c.created_at, c.updated_at
      ORDER BY c.created_at DESC
    `;
    
    const { rows } = await db.query(query);
    return rows;
  }

  static async findById(id) {
    const query = `
      SELECT c.*, 
             COUNT(DISTINCT cm.user_id) as members_count,
             COUNT(DISTINCT i.item_id) as items_count
      FROM classrooms c
      LEFT JOIN classroom_memberships cm ON c.id = cm.classroom_id
      LEFT JOIN items i ON i.owner_id = cm.user_id
      WHERE c.id = $1
      GROUP BY c.id, c.name, c.code, c.description, c.instructor, c.created_at, c.updated_at
    `;
    
    const { rows } = await db.query(query, [id]);
    return rows[0];
  }

  static async findByUser(userId) {
    const query = `
      SELECT c.*, 
             COUNT(DISTINCT cm2.user_id) as members_count,
             COUNT(DISTINCT i.item_id) as items_count,
             COUNT(DISTINCT m.id) FILTER (WHERE m.created_at > cm.joined_at AND m.user_id != $1) as unread_messages
      FROM classrooms c
      INNER JOIN classroom_memberships cm ON c.id = cm.classroom_id
      LEFT JOIN classroom_memberships cm2 ON c.id = cm2.classroom_id
      LEFT JOIN items i ON i.owner_id = cm2.user_id
      LEFT JOIN messages m ON c.id = m.classroom_id
      WHERE cm.user_id = $1
      GROUP BY c.id, c.name, c.code, c.description, c.instructor, c.created_at, c.updated_at, cm.joined_at
      ORDER BY c.created_at DESC
    `;
    
    const { rows } = await db.query(query, [userId]);
    return rows;
  }

  static async joinClassroom(classroomId, userId) {
    const query = `
      INSERT INTO classroom_memberships (classroom_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (classroom_id, user_id) DO NOTHING
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [classroomId, userId]);
    return rows[0];
  }

  static async leaveClassroom(classroomId, userId) {
    const query = `
      DELETE FROM classroom_memberships 
      WHERE classroom_id = $1 AND user_id = $2
      RETURNING *
    `;
    
    const { rows } = await db.query(query, [classroomId, userId]);
    return rows[0];
  }

  static async isUserMember(classroomId, userId) {
    const query = `
      SELECT * FROM classroom_memberships 
      WHERE classroom_id = $1 AND user_id = $2
    `;
    
    const { rows } = await db.query(query, [classroomId, userId]);
    return rows.length > 0;
  }
}

module.exports = Classroom;
