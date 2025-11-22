const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');
const crypto = require('crypto');
const logger = require('../config/logger');

// Ensure upload directories exist
const ensureDirectoryExists = async (dir) => {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/items');
    await ensureDirectoryExists(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueName = crypto.randomUUID();
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueName}${extension}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per upload
  }
});

// Image processing middleware
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  try {
    const processedImages = [];
    
    for (const file of req.files) {
      const filename = path.parse(file.filename).name;
      const uploadDir = path.dirname(file.path);
      
      // Create different sizes
      const sizes = {
        thumbnail: { width: 150, height: 150 },
        small: { width: 300, height: 300 },
        medium: { width: 600, height: 600 },
        large: { width: 1200, height: 1200 }
      };

      const imagePaths = {
        original: file.filename
      };

      for (const [sizeName, dimensions] of Object.entries(sizes)) {
        const outputPath = path.join(uploadDir, `${filename}_${sizeName}.webp`);
        
        await sharp(file.path)
          .resize(dimensions.width, dimensions.height, {
            fit: 'cover',
            withoutEnlargement: true
          })
          .webp({ quality: 85 })
          .toFile(outputPath);

        imagePaths[sizeName] = `${filename}_${sizeName}.webp`;
      }

      // Convert original to webp for better compression
      const originalWebpPath = path.join(uploadDir, `${filename}_original.webp`);
      await sharp(file.path)
        .webp({ quality: 90 })
        .toFile(originalWebpPath);

      imagePaths.original = `${filename}_original.webp`;

      // Remove the original uploaded file
      await fs.unlink(file.path);

      processedImages.push({
        originalName: file.originalname,
        filename: filename,
        paths: imagePaths,
        size: file.size
      });
    }

    req.processedImages = processedImages;
    next();
  } catch (error) {
    logger.error('Image processing error:', error);
    next(error);
  }
};

// Delete images utility
const deleteImages = async (imagePaths) => {
  try {
    const uploadDir = path.join(__dirname, '../../../uploads/items');
    
    for (const imagePath of imagePaths) {
      if (typeof imagePath === 'object') {
        // If it's an object with different sizes
        for (const path of Object.values(imagePath)) {
          try {
            await fs.unlink(path.join(uploadDir, path));
          } catch (error) {
            logger.warn(`Failed to delete image: ${path}`, error);
          }
        }
      } else {
        // If it's a simple path string
        try {
          await fs.unlink(path.join(uploadDir, imagePath));
        } catch (error) {
          logger.warn(`Failed to delete image: ${imagePath}`, error);
        }
      }
    }
  } catch (error) {
    logger.error('Delete images error:', error);
  }
};

module.exports = {
  upload: upload.array('images', 5),
  processImages,
  deleteImages,
  ensureDirectoryExists
};
