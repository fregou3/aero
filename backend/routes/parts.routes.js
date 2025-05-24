const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../models');
const AircraftPart = db.aircraftPart;
const Aircraft = db.aircraft;
const InventoryItem = db.inventoryItem;

/**
 * @swagger
 * /api/parts:
 *   get:
 *     summary: Get all aircraft parts
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by part category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by part status
 *     responses:
 *       200:
 *         description: List of aircraft parts
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { category, status } = req.query;
    const whereClause = {};
    
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    
    const parts = await AircraftPart.findAll({
      where: whereClause,
      include: [
        {
          model: Aircraft,
          as: 'aircraft',
          attributes: ['id', 'registrationNumber', 'model']
        }
      ],
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
 * /api/parts/{id}:
 *   get:
 *     summary: Get part by ID
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     responses:
 *       200:
 *         description: Part details
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const part = await AircraftPart.findByPk(req.params.id, {
      include: [
        {
          model: Aircraft,
          as: 'aircraft',
          attributes: ['id', 'registrationNumber', 'model']
        },
        {
          model: InventoryItem,
          as: 'inventoryItems'
        }
      ]
    });
    
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/parts:
 *   post:
 *     summary: Create a new aircraft part
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - partNumber
 *               - name
 *               - category
 *               - aircraftId
 *             properties:
 *               partNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [fuselage_front, fuselage_center, fuselage_rear, wing_left, wing_right, empennage, landing_gear, engine, avionics, hydraulics, electrical]
 *               subCategory:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               installationDate:
 *                 type: string
 *                 format: date-time
 *               lifeLimitHours:
 *                 type: number
 *               lifeLimitCycles:
 *                 type: integer
 *               currentHours:
 *                 type: number
 *               currentCycles:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [installed, removed, in_repair, scrapped]
 *               position:
 *                 type: string
 *               coordinates:
 *                 type: object
 *               maintenanceHistory:
 *                 type: object
 *               aircraftId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Part created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  [
    check('partNumber', 'Part number is required').not().isEmpty(),
    check('name', 'Name is required').not().isEmpty(),
    check('category', 'Valid category is required').isIn([
      'fuselage_front', 'fuselage_center', 'fuselage_rear', 
      'wing_left', 'wing_right', 'empennage', 'landing_gear', 
      'engine', 'avionics', 'hydraulics', 'electrical'
    ]),
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

      const part = await AircraftPart.create(req.body);
      res.status(201).json(part);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/parts/{id}:
 *   put:
 *     summary: Update an aircraft part
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               subCategory:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               installationDate:
 *                 type: string
 *                 format: date-time
 *               lifeLimitHours:
 *                 type: number
 *               lifeLimitCycles:
 *                 type: integer
 *               currentHours:
 *                 type: number
 *               currentCycles:
 *                 type: integer
 *               status:
 *                 type: string
 *               position:
 *                 type: string
 *               coordinates:
 *                 type: object
 *               maintenanceHistory:
 *                 type: object
 *               aircraftId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Part updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    let part = await AircraftPart.findByPk(req.params.id);
    
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    // If changing aircraft, verify the new aircraft exists
    if (req.body.aircraftId && req.body.aircraftId !== part.aircraftId) {
      const aircraft = await Aircraft.findByPk(req.body.aircraftId);
      if (!aircraft) {
        return res.status(400).json({ message: 'Aircraft not found' });
      }
    }
    
    // If updating status to 'removed', update the removal date
    if (req.body.status === 'removed' && part.status !== 'removed') {
      req.body.removalDate = new Date();
    }
    
    // If updating maintenance history, merge with existing history
    if (req.body.maintenanceHistory) {
      const currentHistory = part.maintenanceHistory || [];
      req.body.maintenanceHistory = [
        ...currentHistory,
        {
          date: new Date(),
          action: 'update',
          details: req.body.maintenanceHistory
        }
      ];
    }
    
    await part.update(req.body);
    
    res.json(part);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/parts/{id}:
 *   delete:
 *     summary: Delete an aircraft part
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     responses:
 *       200:
 *         description: Part deleted
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const part = await AircraftPart.findByPk(req.params.id);
    
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    await part.destroy();
    
    res.json({ message: 'Part removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/parts/{id}/inventory:
 *   get:
 *     summary: Get inventory items for a part
 *     tags: [Parts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Part ID
 *     responses:
 *       200:
 *         description: List of inventory items
 *       404:
 *         description: Part not found
 *       500:
 *         description: Server error
 */
router.get('/:id/inventory', async (req, res) => {
  try {
    const part = await AircraftPart.findByPk(req.params.id);
    
    if (!part) {
      return res.status(404).json({ message: 'Part not found' });
    }
    
    const inventoryItems = await InventoryItem.findAll({
      where: { aircraftPartId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    
    res.json(inventoryItems);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
