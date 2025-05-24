const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');
const db = require('../models');
const TechnicalDocument = db.technicalDocument;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter to only allow certain document types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.jpg', '.jpeg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, JPEG, and PNG files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @swagger
 * /api/documents:
 *   get:
 *     summary: Get all technical documents
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by document category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by document status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, description, and keywords
 *     responses:
 *       200:
 *         description: List of technical documents
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let whereClause = {};
    
    if (category) whereClause.category = category;
    if (status) whereClause.status = status;
    
    if (search) {
      whereClause[db.Sequelize.Op.or] = [
        { title: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { description: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        { documentNumber: { [db.Sequelize.Op.iLike]: `%${search}%` } }
      ];
    }
    
    const documents = await TechnicalDocument.findAll({
      where: whereClause,
      order: [
        ['category', 'ASC'],
        ['issueDate', 'DESC']
      ]
    });
    
    res.json(documents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/documents/{id}:
 *   get:
 *     summary: Get technical document by ID
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document details
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const document = await TechnicalDocument.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/documents:
 *   post:
 *     summary: Upload a new technical document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - documentNumber
 *               - title
 *               - category
 *               - version
 *               - issueDate
 *               - file
 *             properties:
 *               documentNumber:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [manual, bulletin, directive, report, checklist, procedure, other]
 *               documentType:
 *                 type: string
 *               version:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               author:
 *                 type: string
 *               approvedBy:
 *                 type: string
 *               approvalDate:
 *                 type: string
 *                 format: date-time
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               aircraftModels:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedPartNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Document uploaded
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  upload.single('file'),
  [
    check('documentNumber', 'Document number is required').not().isEmpty(),
    check('title', 'Title is required').not().isEmpty(),
    check('category', 'Valid category is required').isIn(['manual', 'bulletin', 'directive', 'report', 'checklist', 'procedure', 'other']),
    check('version', 'Version is required').not().isEmpty(),
    check('issueDate', 'Issue date is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If validation fails, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Document file is required' });
      }

      // Check if document number already exists
      const existingDoc = await TechnicalDocument.findOne({
        where: { documentNumber: req.body.documentNumber }
      });
      if (existingDoc) {
        // Delete the uploaded file
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: 'Document number already exists' });
      }

      // Parse arrays from form data
      let keywords = [];
      let aircraftModels = [];
      let relatedPartNumbers = [];
      let relatedDocuments = [];

      if (req.body.keywords) {
        try {
          keywords = JSON.parse(req.body.keywords);
        } catch (e) {
          keywords = req.body.keywords.split(',').map(k => k.trim());
        }
      }

      if (req.body.aircraftModels) {
        try {
          aircraftModels = JSON.parse(req.body.aircraftModels);
        } catch (e) {
          aircraftModels = req.body.aircraftModels.split(',').map(m => m.trim());
        }
      }

      if (req.body.relatedPartNumbers) {
        try {
          relatedPartNumbers = JSON.parse(req.body.relatedPartNumbers);
        } catch (e) {
          relatedPartNumbers = req.body.relatedPartNumbers.split(',').map(p => p.trim());
        }
      }

      if (req.body.relatedDocuments) {
        try {
          relatedDocuments = JSON.parse(req.body.relatedDocuments);
        } catch (e) {
          relatedDocuments = req.body.relatedDocuments.split(',').map(d => d.trim());
        }
      }

      // Create document record
      const document = await TechnicalDocument.create({
        documentNumber: req.body.documentNumber,
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
        documentType: req.body.documentType,
        version: req.body.version,
        issueDate: new Date(req.body.issueDate),
        effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : null,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : null,
        status: req.body.status || 'active',
        author: req.body.author,
        approvedBy: req.body.approvedBy,
        approvalDate: req.body.approvalDate ? new Date(req.body.approvalDate) : null,
        filePath: req.file.path,
        fileType: path.extname(req.file.originalname).substring(1),
        fileSize: req.file.size,
        checksum: req.body.checksum,
        keywords: keywords,
        aircraftModels: aircraftModels,
        relatedPartNumbers: relatedPartNumbers,
        relatedDocuments: relatedDocuments,
        notes: req.body.notes
      });

      res.status(201).json(document);
    } catch (err) {
      console.error(err.message);
      // If error occurs, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/documents/{id}:
 *   put:
 *     summary: Update a technical document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               documentNumber:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               documentType:
 *                 type: string
 *               version:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date-time
 *               effectiveDate:
 *                 type: string
 *                 format: date-time
 *               expiryDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *               author:
 *                 type: string
 *               approvedBy:
 *                 type: string
 *               approvalDate:
 *                 type: string
 *                 format: date-time
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               aircraftModels:
 *                 type: array
 *                 items:
 *                   type: string
 *               relatedPartNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *               notes:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document updated
 *       400:
 *         description: Validation error
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:id',
  upload.single('file'),
  async (req, res) => {
    try {
      const document = await TechnicalDocument.findByPk(req.params.id);
      
      if (!document) {
        // If document not found but file was uploaded, delete it
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Document not found' });
      }

      // If changing document number, check if new number already exists
      if (req.body.documentNumber && req.body.documentNumber !== document.documentNumber) {
        const existingDoc = await TechnicalDocument.findOne({
          where: {
            documentNumber: req.body.documentNumber,
            id: { [db.Sequelize.Op.ne]: req.params.id }
          }
        });
        if (existingDoc) {
          // Delete the uploaded file
          if (req.file) {
            fs.unlinkSync(req.file.path);
          }
          return res.status(400).json({ message: 'Document number already exists' });
        }
      }

      // Parse arrays from form data
      let keywords = document.keywords;
      let aircraftModels = document.aircraftModels;
      let relatedPartNumbers = document.relatedPartNumbers;
      let relatedDocuments = document.relatedDocuments;

      if (req.body.keywords) {
        try {
          keywords = JSON.parse(req.body.keywords);
        } catch (e) {
          keywords = req.body.keywords.split(',').map(k => k.trim());
        }
      }

      if (req.body.aircraftModels) {
        try {
          aircraftModels = JSON.parse(req.body.aircraftModels);
        } catch (e) {
          aircraftModels = req.body.aircraftModels.split(',').map(m => m.trim());
        }
      }

      if (req.body.relatedPartNumbers) {
        try {
          relatedPartNumbers = JSON.parse(req.body.relatedPartNumbers);
        } catch (e) {
          relatedPartNumbers = req.body.relatedPartNumbers.split(',').map(p => p.trim());
        }
      }

      if (req.body.relatedDocuments) {
        try {
          relatedDocuments = JSON.parse(req.body.relatedDocuments);
        } catch (e) {
          relatedDocuments = req.body.relatedDocuments.split(',').map(d => d.trim());
        }
      }

      // Prepare update data
      const updateData = {
        documentNumber: req.body.documentNumber || document.documentNumber,
        title: req.body.title || document.title,
        description: req.body.description !== undefined ? req.body.description : document.description,
        category: req.body.category || document.category,
        documentType: req.body.documentType || document.documentType,
        version: req.body.version || document.version,
        issueDate: req.body.issueDate ? new Date(req.body.issueDate) : document.issueDate,
        effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : document.effectiveDate,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : document.expiryDate,
        status: req.body.status || document.status,
        author: req.body.author || document.author,
        approvedBy: req.body.approvedBy || document.approvedBy,
        approvalDate: req.body.approvalDate ? new Date(req.body.approvalDate) : document.approvalDate,
        keywords: keywords,
        aircraftModels: aircraftModels,
        relatedPartNumbers: relatedPartNumbers,
        relatedDocuments: relatedDocuments,
        notes: req.body.notes !== undefined ? req.body.notes : document.notes
      };

      // If a new file was uploaded
      if (req.file) {
        // Store the old file path to delete it after successful update
        const oldFilePath = document.filePath;
        
        // Update file-related fields
        updateData.filePath = req.file.path;
        updateData.fileType = path.extname(req.file.originalname).substring(1);
        updateData.fileSize = req.file.size;
        updateData.checksum = req.body.checksum || document.checksum;
        
        // Update document
        await document.update(updateData);
        
        // Delete the old file if it exists
        if (oldFilePath && fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      } else {
        // Update document without changing file
        await document.update(updateData);
      }
      
      res.json(document);
    } catch (err) {
      console.error(err.message);
      // If error occurs, delete the uploaded file
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ message: 'Server error' });
    }
  }
);

/**
 * @swagger
 * /api/documents/{id}:
 *   delete:
 *     summary: Delete a technical document
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document deleted
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', async (req, res) => {
  try {
    const document = await TechnicalDocument.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Store file path to delete after document is removed from database
    const filePath = document.filePath;
    
    await document.destroy();
    
    // Delete the file if it exists
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    res.json({ message: 'Document removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/documents/download/{id}:
 *   get:
 *     summary: Download a document file
 *     tags: [Documents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Document ID
 *     responses:
 *       200:
 *         description: Document file
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Document not found
 *       500:
 *         description: Server error
 */
router.get('/download/:id', async (req, res) => {
  try {
    const document = await TechnicalDocument.findByPk(req.params.id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    // Check if file exists
    if (!document.filePath || !fs.existsSync(document.filePath)) {
      return res.status(404).json({ message: 'Document file not found' });
    }
    
    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename=${document.documentNumber}-${document.version}.${document.fileType}`);
    res.setHeader('Content-Type', `application/${document.fileType}`);
    
    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
