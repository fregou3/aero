const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../models');
const Aircraft = db.aircraft;
const AircraftPart = db.aircraftPart;
const MaintenanceTask = db.maintenanceTask;

/**
 * @swagger
 * /api/aircraft:
 *   get:
 *     summary: Get all aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by aircraft status
 *     responses:
 *       200:
 *         description: List of aircraft
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status } : {};
    
    const aircraft = await Aircraft.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
    
    res.json(aircraft);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/aircraft/{id}:
 *   get:
 *     summary: Get aircraft by ID
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft ID
 *     responses:
 *       200:
 *         description: Aircraft details
 *       404:
 *         description: Aircraft not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const aircraft = await Aircraft.findByPk(req.params.id);
    
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    res.json(aircraft);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/aircraft:
 *   post:
 *     summary: Create a new aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - registrationNumber
 *               - serialNumber
 *               - model
 *               - yearOfManufacture
 *             properties:
 *               registrationNumber:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               yearOfManufacture:
 *                 type: integer
 *               totalFlightHours:
 *                 type: number
 *               totalCycles:
 *                 type: integer
 *               lastMaintenanceDate:
 *                 type: string
 *                 format: date-time
 *               nextMaintenanceDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, grounded, retired]
 *               configuration:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Aircraft created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    check('registrationNumber', 'Registration number is required').not().isEmpty(),
    check('serialNumber', 'Serial number is required').not().isEmpty(),
    check('model', 'Model is required').not().isEmpty(),
    check('yearOfManufacture', 'Year of manufacture is required').isInt()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if aircraft with same registration or serial already exists
      const existingAircraft = await Aircraft.findOne({
        where: {
          [db.Sequelize.Op.or]: [
            { registrationNumber: req.body.registrationNumber },
            { serialNumber: req.body.serialNumber }
          ]
        }
      });

      if (existingAircraft) {
        return res.status(400).json({ 
          message: 'Aircraft with this registration number or serial number already exists' 
        });
      }

      const aircraft = await Aircraft.create(req.body);
      res.status(201).json(aircraft);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/aircraft/{id}:
 *   put:
 *     summary: Update an aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               registrationNumber:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               model:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               yearOfManufacture:
 *                 type: integer
 *               totalFlightHours:
 *                 type: number
 *               totalCycles:
 *                 type: integer
 *               lastMaintenanceDate:
 *                 type: string
 *                 format: date-time
 *               nextMaintenanceDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [active, maintenance, grounded, retired]
 *               configuration:
 *                 type: object
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Aircraft updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Aircraft not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    let aircraft = await Aircraft.findByPk(req.params.id);
    
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    // Check if updating to a registration or serial that already exists on another aircraft
    if (req.body.registrationNumber || req.body.serialNumber) {
      const existingAircraft = await Aircraft.findOne({
        where: {
          id: { [db.Sequelize.Op.ne]: req.params.id },
          [db.Sequelize.Op.or]: [
            req.body.registrationNumber ? { registrationNumber: req.body.registrationNumber } : null,
            req.body.serialNumber ? { serialNumber: req.body.serialNumber } : null
          ].filter(Boolean)
        }
      });

      if (existingAircraft) {
        return res.status(400).json({ 
          message: 'Aircraft with this registration number or serial number already exists' 
        });
      }
    }
    
    await aircraft.update(req.body);
    
    res.json(aircraft);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/aircraft/{id}:
 *   delete:
 *     summary: Delete an aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft ID
 *     responses:
 *       200:
 *         description: Aircraft deleted
 *       404:
 *         description: Aircraft not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const aircraft = await Aircraft.findByPk(req.params.id);
    
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    await aircraft.destroy();
    
    res.json({ message: 'Aircraft removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/aircraft/{id}/parts:
 *   get:
 *     summary: Get all parts for an aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft ID
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by part category
 *     responses:
 *       200:
 *         description: List of aircraft parts
 *       404:
 *         description: Aircraft not found
 *       500:
 *         description: Server error
 */
router.get('/:id/parts', async (req, res) => {
  try {
    const { category } = req.query;
    
    // Check if aircraft exists
    const aircraft = await Aircraft.findByPk(req.params.id);
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    // Get parts for this aircraft
    const whereClause = { aircraftId: req.params.id };
    if (category) {
      whereClause.category = category;
    }
    
    const parts = await AircraftPart.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['name', 'ASC']]
    });
    
    res.json(parts);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/aircraft/{id}/maintenance:
 *   get:
 *     summary: Get all maintenance tasks for an aircraft
 *     tags: [Aircraft]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Aircraft ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by task status
 *     responses:
 *       200:
 *         description: List of maintenance tasks
 *       404:
 *         description: Aircraft not found
 *       500:
 *         description: Server error
 */
router.get('/:id/maintenance', async (req, res) => {
  try {
    const { status } = req.query;
    
    // Check if aircraft exists
    const aircraft = await Aircraft.findByPk(req.params.id);
    if (!aircraft) {
      return res.status(404).json({ message: 'Aircraft not found' });
    }
    
    // Get maintenance tasks for this aircraft
    const whereClause = { aircraftId: req.params.id };
    if (status) {
      whereClause.status = status;
    }
    
    const tasks = await MaintenanceTask.findAll({
      where: whereClause,
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

module.exports = router;
