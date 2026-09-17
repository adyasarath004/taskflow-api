const db = require('../config/db');

async function getTasks(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM tasks WHERE user_id = ?', [req.user.id]);
    return res.status(200).json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error fetching tasks' });
  }
}

async function createTask(req, res) {
  try {
    const { title, description, status } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description || null, status || 'pending']
    );

    return res.status(201).json({ id: result.insertId, title, description, status: status || 'pending' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error creating task' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.query(
      'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
      [
        title || existing[0].title,
        description !== undefined ? description : existing[0].description,
        status || existing[0].status,
        id,
        req.user.id
      ]
    );

    return res.status(200).json({ message: 'Task updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error updating task' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.status(200).json({ message: 'Task deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error deleting task' });
  }
}

module.exports = { getTasks, createTask, updateTask, deleteTask };
