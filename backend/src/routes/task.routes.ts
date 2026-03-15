// ============================================================
// Task Routes — /tasks/* (all protected)
// ============================================================

import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createTaskValidator, updateTaskValidator,
  taskIdValidator, taskQueryValidator, validate,
} from '../middlewares/validation.middleware';

const router = Router();

// Apply auth to all task routes
router.use(authenticate);

router.get('/',              taskQueryValidator,                     validate, TaskController.getTasks);
router.post('/',             createTaskValidator,                    validate, TaskController.createTask);
router.get('/:id',           taskIdValidator,                        validate, TaskController.getTaskById);
router.patch('/:id',         taskIdValidator, updateTaskValidator,   validate, TaskController.updateTask);
router.patch('/:id/toggle',  taskIdValidator,                        validate, TaskController.toggleTask);
router.delete('/:id',        taskIdValidator,                        validate, TaskController.deleteTask);

export default router;
