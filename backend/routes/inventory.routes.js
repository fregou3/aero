const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const db = require('../models');
const InventoryItem = db.inventoryItem;
const AircraftPart = db.aircraftPart;

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by item status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by item category
 *       - in: query
 *         name: belowMinStock
 *         schema:
 *           type: boolean
 *         description: Filter items below minimum stock level
 *     responses:
 *       200:
 *         description: List of inventory items
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { status, category, belowMinStock } = req.query;
    const whereClause = {};
    
    if (status) whereClause.status = status;
    if (category) whereClause.category = category;
    if (belowMinStock === 'true') {
      whereClause[db.Sequelize.Op.and] = [
        { quantity: { [db.Sequelize.Op.lt]: db.Sequelize.col('minStockLevel') } }
      ];
    }
    
    const items = await InventoryItem.findAll({
      where: whereClause,
      include: [
        {
          model: AircraftPart,
          as: 'aircraftPart',
          attributes: ['id', 'partNumber', 'name', 'category']
        }
      ],
      order: [
        ['category', 'ASC'],
        ['name', 'ASC']
      ]
    });
    
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   get:
 *     summary: Get inventory item by ID
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item details
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id, {
      include: [
        {
          model: AircraftPart,
          as: 'aircraftPart',
          attributes: ['id', 'partNumber', 'name', 'category', 'aircraftId']
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/inventory:
 *   post:
 *     summary: Create a new inventory item
 *     tags: [Inventory]
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
 *               - quantity
 *             properties:
 *               partNumber:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unitOfMeasure:
 *                 type: string
 *               minStockLevel:
 *                 type: integer
 *               reorderPoint:
 *                 type: integer
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [available, reserved, in_use, defective, expired]
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *               purchasePrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               certificationDate:
 *                 type: string
 *                 format: date-time
 *               lastInspectionDate:
 *                 type: string
 *                 format: date-time
 *               nextInspectionDate:
 *                 type: string
 *                 format: date-time
 *               aircraftCompatibility:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               aircraftPartId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Inventory item created
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
    check('quantity', 'Quantity is required').isInt({ min: 0 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // If aircraftPartId is provided, check if it exists
      if (req.body.aircraftPartId) {
        const part = await AircraftPart.findByPk(req.body.aircraftPartId);
        if (!part) {
          return res.status(400).json({ message: 'Aircraft part not found' });
        }
      }

      const item = await InventoryItem.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               partNumber:
 *                 type: string
 *               serialNumber:
 *                 type: string
 *               batchNumber:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               manufacturer:
 *                 type: string
 *               quantity:
 *                 type: integer
 *               unitOfMeasure:
 *                 type: string
 *               minStockLevel:
 *                 type: integer
 *               reorderPoint:
 *                 type: integer
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date-time
 *               purchasePrice:
 *                 type: number
 *               supplier:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               certificationDate:
 *                 type: string
 *                 format: date-time
 *               lastInspectionDate:
 *                 type: string
 *                 format: date-time
 *               nextInspectionDate:
 *                 type: string
 *                 format: date-time
 *               aircraftCompatibility:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *               aircraftPartId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory item updated
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
  try {
    let item = await InventoryItem.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    // If aircraftPartId is changing, check if new part exists
    if (req.body.aircraftPartId && req.body.aircraftPartId !== item.aircraftPartId) {
      const part = await AircraftPart.findByPk(req.body.aircraftPartId);
      if (!part) {
        return res.status(400).json({ message: 'Aircraft part not found' });
      }
    }
    
    // Check if quantity is changing to below minStockLevel
    if (req.body.quantity !== undefined && 
        req.body.quantity < (req.body.minStockLevel || item.minStockLevel)) {
      // Here you could trigger notifications or automatic reordering
      console.log(`Inventory item ${item.partNumber} is below minimum stock level`);
    }
    
    await item.update(req.body);
    
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const item = await InventoryItem.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }
    
    await item.destroy();
    
    res.json({ message: 'Inventory item removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/inventory/adjust/{id}:
 *   post:
 *     summary: Adjust inventory item quantity
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adjustment
 *               - reason
 *             properties:
 *               adjustment:
 *                 type: integer
 *                 description: Positive for adding, negative for removing
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Inventory quantity adjusted
 *       400:
 *         description: Validation error
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.post(
  '/adjust/:id',
  [
    check('adjustment', 'Adjustment value is required').isInt(),
    check('reason', 'Reason is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { adjustment, reason, notes } = req.body;
      
      const item = await InventoryItem.findByPk(req.params.id);
      if (!item) {
        return res.status(404).json({ message: 'Inventory item not found' });
      }
      
      // Calculate new quantity
      const newQuantity = item.quantity + adjustment;
      
      // Prevent negative inventory
      if (newQuantity < 0) {
        return res.status(400).json({ 
          message: 'Cannot adjust to negative quantity. Current quantity: ' + item.quantity 
        });
      }
      
      // Update the quantity
      await item.update({ 
        quantity: newQuantity,
        notes: notes ? `${item.notes || ''}\n${new Date().toISOString()}: ${reason} - ${notes}` : item.notes
      });
      
      // Check if new quantity is below reorder point
      if (newQuantity <= item.reorderPoint) {
        // Here you could trigger notifications or automatic reordering
        console.log(`Inventory item ${item.partNumber} is at or below reorder point`);
      }
      
      res.json({
        message: `Inventory adjusted by ${adjustment}`,
        item
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

module.exports = router;
