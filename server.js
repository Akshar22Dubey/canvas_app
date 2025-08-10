const express = require('express');
const { createCanvas, loadImage, registerFont } = require('canvas');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Global canvas state
let canvasState = {
  width: 800,
  height: 600,
  elements: []
};

// Initialize canvas endpoint
app.post('/api/canvas/init', (req, res) => {
  try {
    const { width, height } = req.body;
    
    if (!width || !height || width <= 0 || height <= 0) {
      return res.status(400).json({ error: 'Valid width and height are required' });
    }

    canvasState = {
      width: parseInt(width),
      height: parseInt(height),
      elements: []
    };

    res.json({ 
      success: true, 
      message: 'Canvas initialized',
      canvas: canvasState 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add rectangle endpoint
app.post('/api/canvas/add-rectangle', (req, res) => {
  try {
    const { x, y, width, height, fillColor, strokeColor, strokeWidth } = req.body;

    const element = {
      type: 'rectangle',
      id: Date.now().toString(),
      x: parseInt(x) || 0,
      y: parseInt(y) || 0,
      width: parseInt(width) || 100,
      height: parseInt(height) || 100,
      fillColor: fillColor || '#000000',
      strokeColor: strokeColor || '#000000',
      strokeWidth: parseInt(strokeWidth) || 1
    };

    canvasState.elements.push(element);
    res.json({ success: true, element, canvas: canvasState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add circle endpoint
app.post('/api/canvas/add-circle', (req, res) => {
  try {
    const { x, y, radius, fillColor, strokeColor, strokeWidth } = req.body;

    const element = {
      type: 'circle',
      id: Date.now().toString(),
      x: parseInt(x) || 0,
      y: parseInt(y) || 0,
      radius: parseInt(radius) || 50,
      fillColor: fillColor || '#000000',
      strokeColor: strokeColor || '#000000',
      strokeWidth: parseInt(strokeWidth) || 1
    };

    canvasState.elements.push(element);
    res.json({ success: true, element, canvas: canvasState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add text endpoint
app.post('/api/canvas/add-text', (req, res) => {
  try {
    const { x, y, text, fontSize, fontFamily, color } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const element = {
      type: 'text',
      id: Date.now().toString(),
      x: parseInt(x) || 0,
      y: parseInt(y) || 0,
      text: text,
      fontSize: parseInt(fontSize) || 16,
      fontFamily: fontFamily || 'Arial',
      color: color || '#000000'
    };

    canvasState.elements.push(element);
    res.json({ success: true, element, canvas: canvasState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add image endpoint
app.post('/api/canvas/add-image', upload.single('image'), async (req, res) => {
  try {
    const { x, y, width, height, imageUrl } = req.body;
    let imageBuffer;

    if (req.file) {
      // Handle uploaded file
      imageBuffer = req.file.buffer;
    } else if (imageUrl) {
      // Handle image URL (for simplicity, we'll store the URL)
      const element = {
        type: 'image',
        id: Date.now().toString(),
        x: parseInt(x) || 0,
        y: parseInt(y) || 0,
        width: parseInt(width) || 100,
        height: parseInt(height) || 100,
        imageUrl: imageUrl
      };

      canvasState.elements.push(element);
      return res.json({ success: true, element, canvas: canvasState });
    } else {
      return res.status(400).json({ error: 'Image file or URL is required' });
    }

    // Process uploaded image
    const processedImage = await sharp(imageBuffer)
      .resize(parseInt(width) || 100, parseInt(height) || 100)
      .png()
      .toBuffer();

    const element = {
      type: 'image',
      id: Date.now().toString(),
      x: parseInt(x) || 0,
      y: parseInt(y) || 0,
      width: parseInt(width) || 100,
      height: parseInt(height) || 100,
      imageData: processedImage.toString('base64')
    };

    canvasState.elements.push(element);
    res.json({ success: true, element, canvas: canvasState });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get canvas state endpoint
app.get('/api/canvas/state', (req, res) => {
  res.json({ success: true, canvas: canvasState });
});

// Clear canvas endpoint
app.post('/api/canvas/clear', (req, res) => {
  canvasState.elements = [];
  res.json({ success: true, canvas: canvasState });
});

// Export as PDF endpoint
app.post('/api/canvas/export-pdf', async (req, res) => {
  try {
    // Create canvas with current state
    const canvas = createCanvas(canvasState.width, canvasState.height);
    const ctx = canvas.getContext('2d');

    // Fill background with white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasState.width, canvasState.height);

    // Draw all elements
    for (const element of canvasState.elements) {
      await drawElement(ctx, element);
    }

    // Create PDF
    const doc = new PDFDocument({
      size: [canvasState.width, canvasState.height],
      compress: true // Enable compression
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="canvas-export.pdf"');

    // Pipe PDF to response
    doc.pipe(res);

    // Add canvas as image to PDF
    const canvasBuffer = canvas.toBuffer('image/png');
    
    // Compress the image before adding to PDF
    const compressedBuffer = await sharp(canvasBuffer)
      .png({ quality: 80, compressionLevel: 9 })
      .toBuffer();

    doc.image(compressedBuffer, 0, 0, {
      width: canvasState.width,
      height: canvasState.height
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to draw elements on canvas
async function drawElement(ctx, element) {
  switch (element.type) {
    case 'rectangle':
      ctx.fillStyle = element.fillColor;
      ctx.strokeStyle = element.strokeColor;
      ctx.lineWidth = element.strokeWidth;
      ctx.fillRect(element.x, element.y, element.width, element.height);
      ctx.strokeRect(element.x, element.y, element.width, element.height);
      break;

    case 'circle':
      ctx.beginPath();
      ctx.arc(element.x + element.radius, element.y + element.radius, element.radius, 0, 2 * Math.PI);
      ctx.fillStyle = element.fillColor;
      ctx.fill();
      ctx.strokeStyle = element.strokeColor;
      ctx.lineWidth = element.strokeWidth;
      ctx.stroke();
      break;

    case 'text':
      ctx.fillStyle = element.color;
      ctx.font = `${element.fontSize}px ${element.fontFamily}`;
      ctx.fillText(element.text, element.x, element.y + element.fontSize);
      break;

    case 'image':
      try {
        let image;
        if (element.imageData) {
          // Handle base64 image data
          const buffer = Buffer.from(element.imageData, 'base64');
          image = await loadImage(buffer);
        } else if (element.imageUrl) {
          // Handle image URL
          image = await loadImage(element.imageUrl);
        }
        
        if (image) {
          ctx.drawImage(image, element.x, element.y, element.width, element.height);
        }
      } catch (imgError) {
        console.error('Error loading image:', imgError);
      }
      break;
  }
}

// Create public directory if it doesn't exist
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 