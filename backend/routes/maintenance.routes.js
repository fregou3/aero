const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../models');
const MaintenanceTask = db.maintenanceTask;
const WorkOrder = db.workOrder;
const Aircraft = db.aircraft;
const User = db.user;

/**
 * @swagger
 * /api/maintenance:
 *   get:
 *     summary: Get all maintenance tasks
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by task status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by task category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *         description: Filter by task priority
 *     responses:
 *       200:
 *         description: List of maintenance tasks
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (priority) whereClause.priority = priority;
    
    const tasks = await MaintenanceTask.findAll({
      where: whereClause,
      include: [
        {
          model: Aircraft,
          as: 'aircraft',
          attributes: ['id', 'registrationNumber', 'model']
        }
      ],
      order: [
        ['status', 'ASC'],
        ['priority', 'DESC'],
        ['scheduledStartDate', 'ASC']
      ]
    });
    
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/maintenance/{id}:
 *   get:
 *     summary: Get maintenance task by ID
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance task ID
 *     responses:
 *       200:
 *         description: Maintenance task details
 *       404:
 *         description: Maintenance task not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const task = await MaintenanceTask.findByPk(req.params.id, {
      include: [
        {
          model: Aircraft,
          as: 'aircraft',
          attributes: ['id', 'registrationNumber', 'model']
        },
        {
          model: WorkOrder,
          as: 'workOrders',
          include: [
            {
              model: User,
              as: 'assignedTo',
              attributes: ['id', 'firstName', 'lastName', 'role']
            }
          ]
        }
      ]
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Maintenance task not found' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/maintenance:
 *   post:
 *     summary: Create a new maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskNumber
 *               - title
 *               - category
 *               - aircraftId
 *             properties:
 *               taskNumber:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [scheduled, unscheduled, inspection, repair, modification]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, deferred, cancelled]
 *               estimatedDuration:
 *                 type: number
 *               scheduledStartDate:
 *                 type: string
 *                 format: date-time
 *               scheduledEndDate:
 *                 type: string
 *                 format: date-time
 *               aircraftId:
 *                 type: string
 *               relatedPartIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredCertifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredTools:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredParts:
 *                 type: object
 *               documentReferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Maintenance task created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    check('taskNumber', 'Task number is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('category', 'Valid category is required').isIn(['scheduled', 'unscheduled', 'inspection', 'repair', 'modification']),
    check('aircraftId', 'Aircraft ID is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if aircraft exists
      const aircraft = await Aircraft.findByPk(req.body.aircraftId);
      if (!aircraft) {
        return res.status(400).json({ message: 'Aircraft not found' });
      }

      // Check if task number already exists
      const existingTask = await MaintenanceTask.findOne({
        where: { taskNumber: req.body.taskNumber }
      });
      if (existingTask) {
        return res.status(400).json({ message: 'Task number already exists' });
      }

      const task = await MaintenanceTask.create(req.body);
      
      // If task is created, update the aircraft's lastMaintenanceDate
      if (task) {
        await aircraft.update({ 
          lastMaintenanceDate: new Date(),
          status: 'maintenance'
        });
      }
      
      res.status(201).json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/maintenance/{id}:
 *   put:
 *     summary: Update a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taskNumber:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               estimatedDuration:
 *                 type: number
 *               actualDuration:
 *                 type: number
 *               scheduledStartDate:
 *                 type: string
 *                 format: date-time
 *               scheduledEndDate:
 *                 type: string
 *                 format: date-time
 *               actualStartDate:
 *                 type: string
 *                 format: date-time
 *               actualEndDate:
 *                 type: string
 *                 format: date-time
 *               aircraftId:
 *                 type: string
 *               relatedPartIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredCertifications:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredTools:
 *                 type: array
 *                 items:
 *                   type: string
 *               requiredParts:
 *                 type: object
 *               documentReferences:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Maintenance task updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance task not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    let task = await MaintenanceTask.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Maintenance task not found' });
    }
    
    // If changing task number, check if new number already exists
    if (req.body.taskNumber && req.body.taskNumber !== task.taskNumber) {
      const existingTask = await MaintenanceTask.findOne({
        where: {
          taskNumber: req.body.taskNumber,
          id: { [db.Sequelize.Op.ne]: req.params.id }
        }
      });
      if (existingTask) {
        return res.status(400).json({ message: 'Task number already exists' });
      }
    }
    
    // If status is changing to completed, set the actual end date
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.actualEndDate = new Date();
      
      // Also update the aircraft status if needed
      const aircraft = await Aircraft.findByPk(task.aircraftId);
      if (aircraft && aircraft.status === 'maintenance') {
        // Check if this was the last active maintenance task
        const otherActiveTasks = await MaintenanceTask.count({
          where: {
            aircraftId: task.aircraftId,
            id: { [db.Sequelize.Op.ne]: req.params.id },
            status: { [db.Sequelize.Op.in]: ['pending', 'in_progress'] }
          }
        });
        
        if (otherActiveTasks === 0) {
          await aircraft.update({
            status: 'active',
            nextMaintenanceDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          });
        }
      }
    }
    
    // If status is changing to in_progress and there's no actual start date
    if (req.body.status === 'in_progress' && task.status !== 'in_progress' && !task.actualStartDate) {
      req.body.actualStartDate = new Date();
    }
    
    await task.update(req.body);
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/maintenance/{id}:
 *   delete:
 *     summary: Delete a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance task ID
 *     responses:
 *       200:
 *         description: Maintenance task deleted
 *       404:
 *         description: Maintenance task not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const task = await MaintenanceTask.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Maintenance task not found' });
    }
    
    // Check if there are any work orders associated with this task
    const workOrderCount = await WorkOrder.count({
      where: { maintenanceTaskId: req.params.id }
    });
    
    if (workOrderCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete task with associated work orders. Delete work orders first or update task status instead.' 
      });
    }
    
    await task.destroy();
    
    res.json({ message: 'Maintenance task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/maintenance/{id}/workorders:
 *   get:
 *     summary: Get all work orders for a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance task ID
 *     responses:
 *       200:
 *         description: List of work orders
 *       404:
 *         description: Maintenance task not found
 *       500:
 *         description: Server error
 */
router.get('/:id/workorders', async (req, res) => {
  try {
    const task = await MaintenanceTask.findByPk(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Maintenance task not found' });
    }
    
    const workOrders = await WorkOrder.findAll({
      where: { maintenanceTaskId: req.params.id },
      include: [
        {
          model: User,
          as: 'assignedTo',
          attributes: ['id', 'firstName', 'lastName', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(workOrders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/maintenance/{id}/workorders:
 *   post:
 *     summary: Create a new work order for a maintenance task
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Maintenance task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workOrderNumber
 *               - title
 *             properties:
 *               workOrderNumber:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               estimatedHours:
 *                 type: number
 *               assignedToId:
 *                 type: string
 *               procedures:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Work order created
 *       400:
 *         description: Validation error
 *       404:
 *         description: Maintenance task not found
 *       500:
 *         description: Server error
 */
router.post(
  '/:id/workorders',
  [
    check('workOrderNumber', 'Work order number is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if maintenance task exists
      const task = await MaintenanceTask.findByPk(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Maintenance task not found' });
      }

      // Check if work order number already exists
      const existingWorkOrder = await WorkOrder.findOne({
        where: { workOrderNumber: req.body.workOrderNumber }
      });
      if (existingWorkOrder) {
        return res.status(400).json({ message: 'Work order number already exists' });
      }

      // If assignedToId is provided, check if user exists
      if (req.body.assignedToId) {
        const user = await User.findByPk(req.body.assignedToId);
        if (!user) {
          return res.status(400).json({ message: 'Assigned user not found' });
        }
      }

      const workOrder = await WorkOrder.create({
        ...req.body,
        maintenanceTaskId: req.params.id,
        status: req.body.assignedToId ? 'assigned' : 'created'
      });
      
      // If this is the first work order and task is pending, update task to in_progress
      if (task.status === 'pending') {
        await task.update({ 
          status: 'in_progress',
          actualStartDate: new Date()
        });
      }
      
      res.status(201).json(workOrder);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
