const express = require('express');
const authenticate = require('../middleware/auth');
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
