const pool = require('../config/database');

class Task {
  // Get all tasks with optional filtering
  static async findAll(filters = {}) {
    let query = 'SELECT * FROM tasks';
    const values = [];
    const conditions = [];

    if (filters.status) {
      conditions.push(`status = $${values.length + 1}`);
      values.push(filters.status);
    }

    if (filters.priority) {
      conditions.push(`priority = $${values.length + 1}`);
      values.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Get a single task by ID
  static async findById(id) {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    return result.rows[0];
  }

  // Create a new task
  static async create(taskData) {
    const { title, description, status = 'pending', priority = 'medium', due_date } = taskData;
    
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [title, description, status, priority, due_date]
    );
    
    return result.rows[0];
  }

  // Update a task
  static async update(id, taskData) {
    const { title, description, status, priority, due_date } = taskData;
    
    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, priority = $4, due_date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 
       RETURNING *`,
      [title, description, status, priority, due_date, id]
    );
    
    return result.rows[0];
  }

  // Delete a task
  static async delete(id) {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  // Get tasks by status
  static async findByStatus(status) {
    const result = await pool.query('SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC', [status]);
    return result.rows;
  }

  // Get tasks due today or overdue
  static async findDueTasks() {
    const result = await pool.query(
      'SELECT * FROM tasks WHERE due_date <= CURRENT_DATE AND status != $1 ORDER BY due_date ASC',
      ['completed']
    );
    return result.rows;
  }
}

module.exports = Task;
