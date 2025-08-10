
A full-stack application that allows users to draw shapes, add text, upload images, and export the final canvas as a PDF.  
Built with Node.js (Express), HTML5 Canvas API, and vanilla JavaScript, it combines a responsive frontend with a powerful backend rendering engine.

## 🚀 Features

### 🖌 Drawing Tools
- Rectangles – with customizable fill, stroke, and stroke width.
- Circles – with customizable fill, stroke, and stroke width.
- Text – with custom font, size, and color.
- Images – upload from your device or use an image URL.

### 📄 PDF Export
- Generates a high-quality PDF of the current canvas.
- Includes compression to reduce file size while maintaining quality.
- Supports images, shapes, and text in the export.

### ⚡ Other Highlights
- Responsive UI – works well on desktops and tablets.
- Live Preview – instantly see changes on the canvas.
- Backend Rendering – ensures consistent export quality.
- File Upload Support – handled with `multer` and `sharp`.

---

## 🛠 Tech Stack

### **Frontend**
- HTML5, CSS3, JavaScript
- HTML5 `<canvas>` for drawing
- Responsive design for usability

### Backend
- Node.js + Express
- node-canvas → server-side canvas rendering
- PDFKit → PDF generation
- Multer → image file uploads
- Sharp → image processing & compression
- CORS → cross-origin requests

---

## 📂 Project Structure

```
canvas-pdf-app/
├── public/                 # Frontend assets
│   ├── index.html           # Main UI
│   ├── styles.css           # Styling
│   └── script.js            # Frontend logic
├── server.js                # Express server & API routes
├── package.json             # Project dependencies & scripts
└── README.md                # Project documentation
```

---

## 🎯 How to Use
1. **Initialize Canvas** – Set width & height and click “Initialize”.
2. **Add Shapes/Text/Images** – Use the tool panels to insert elements.
3. **Preview Canvas** – See live updates as you add or clear elements.
4. **Export PDF** – Click “Export as PDF” to download your design.


