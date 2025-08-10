// API Base URL
const API_BASE = window.location.origin;

// Canvas state
let currentCanvas = {
    width: 800,
    height: 600,
    elements: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize canvas on page load
    initializeCanvas();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial canvas state
    refreshCanvasState();
});

function setupEventListeners() {
    // Canvas initialization
    document.getElementById('initCanvas').addEventListener('click', initializeCanvas);
    document.getElementById('clearCanvas').addEventListener('click', clearCanvas);
    
    // PDF export
    document.getElementById('exportPdf').addEventListener('click', exportPDF);
    
    // Canvas refresh
    document.getElementById('refreshPreview').addEventListener('click', refreshCanvasState);
}

// Show status message
function showStatus(message, type = 'info', duration = 3000) {
    const statusEl = document.getElementById('statusMessage');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type} show`;
    
    setTimeout(() => {
        statusEl.classList.remove('show');
    }, duration);
}

// Initialize canvas
async function initializeCanvas() {
    const width = parseInt(document.getElementById('canvasWidth').value);
    const height = parseInt(document.getElementById('canvasHeight').value);
    
    if (!width || !height || width < 100 || height < 100) {
        showStatus('Please enter valid canvas dimensions (minimum 100x100)', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ width, height })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Canvas initialized successfully!', 'success');
        } else {
            showStatus(data.error || 'Failed to initialize canvas', 'error');
        }
    } catch (error) {
        showStatus('Error initializing canvas: ' + error.message, 'error');
    }
}

// Clear canvas
async function clearCanvas() {
    try {
        const response = await fetch(`${API_BASE}/api/canvas/clear`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Canvas cleared successfully!', 'success');
        } else {
            showStatus(data.error || 'Failed to clear canvas', 'error');
        }
    } catch (error) {
        showStatus('Error clearing canvas: ' + error.message, 'error');
    }
}

// Add rectangle
async function addRectangle() {
    const rectData = {
        x: parseInt(document.getElementById('rectX').value) || 0,
        y: parseInt(document.getElementById('rectY').value) || 0,
        width: parseInt(document.getElementById('rectWidth').value) || 100,
        height: parseInt(document.getElementById('rectHeight').value) || 80,
        fillColor: document.getElementById('rectFill').value,
        strokeColor: document.getElementById('rectStroke').value,
        strokeWidth: parseInt(document.getElementById('rectStrokeWidth').value) || 2
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/add-rectangle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(rectData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Rectangle added successfully!', 'success');
        } else {
            showStatus(data.error || 'Failed to add rectangle', 'error');
        }
    } catch (error) {
        showStatus('Error adding rectangle: ' + error.message, 'error');
    }
}

// Add circle
async function addCircle() {
    const circleData = {
        x: parseInt(document.getElementById('circleX').value) || 0,
        y: parseInt(document.getElementById('circleY').value) || 0,
        radius: parseInt(document.getElementById('circleRadius').value) || 50,
        fillColor: document.getElementById('circleFill').value,
        strokeColor: document.getElementById('circleStroke').value,
        strokeWidth: parseInt(document.getElementById('circleStrokeWidth').value) || 2
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/add-circle`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(circleData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Circle added successfully!', 'success');
        } else {
            showStatus(data.error || 'Failed to add circle', 'error');
        }
    } catch (error) {
        showStatus('Error adding circle: ' + error.message, 'error');
    }
}

// Add text
async function addText() {
    const textContent = document.getElementById('textContent').value;
    
    if (!textContent.trim()) {
        showStatus('Please enter text content', 'error');
        return;
    }
    
    const textData = {
        x: parseInt(document.getElementById('textX').value) || 0,
        y: parseInt(document.getElementById('textY').value) || 0,
        text: textContent,
        fontSize: parseInt(document.getElementById('textSize').value) || 24,
        fontFamily: document.getElementById('textFont').value,
        color: document.getElementById('textColor').value
    };
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/add-text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(textData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Text added successfully!', 'success');
        } else {
            showStatus(data.error || 'Failed to add text', 'error');
        }
    } catch (error) {
        showStatus('Error adding text: ' + error.message, 'error');
    }
}

// Add image
async function addImage() {
    const imageFile = document.getElementById('imageFile').files[0];
    const imageUrl = document.getElementById('imageUrl').value;
    
    if (!imageFile && !imageUrl) {
        showStatus('Please select an image file or enter an image URL', 'error');
        return;
    }
    
    const formData = new FormData();
    formData.append('x', parseInt(document.getElementById('imageX').value) || 0);
    formData.append('y', parseInt(document.getElementById('imageY').value) || 0);
    formData.append('width', parseInt(document.getElementById('imageWidth').value) || 100);
    formData.append('height', parseInt(document.getElementById('imageHeight').value) || 100);
    
    if (imageFile) {
        formData.append('image', imageFile);
    } else {
        formData.append('imageUrl', imageUrl);
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/add-image`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            showStatus('Image added successfully!', 'success');
            
            // Clear file input
            document.getElementById('imageFile').value = '';
            document.getElementById('imageUrl').value = '';
        } else {
            showStatus(data.error || 'Failed to add image', 'error');
        }
    } catch (error) {
        showStatus('Error adding image: ' + error.message, 'error');
    }
}

// Refresh canvas state from server
async function refreshCanvasState() {
    try {
        const response = await fetch(`${API_BASE}/api/canvas/state`);
        const data = await response.json();
        
        if (data.success) {
            currentCanvas = data.canvas;
            updateCanvasPreview();
            
            // Update canvas dimension inputs
            document.getElementById('canvasWidth').value = currentCanvas.width;
            document.getElementById('canvasHeight').value = currentCanvas.height;
        }
    } catch (error) {
        showStatus('Error refreshing canvas state: ' + error.message, 'error');
    }
}

// Update canvas preview
function updateCanvasPreview() {
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = currentCanvas.width;
    canvas.height = currentCanvas.height;
    
    // Clear canvas with white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, currentCanvas.width, currentCanvas.height);
    
    // Draw all elements
    currentCanvas.elements.forEach(element => {
        drawElementOnPreview(ctx, element);
    });
}

// Draw element on preview canvas
function drawElementOnPreview(ctx, element) {
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
            if (element.imageData) {
                const img = new Image();
                img.onload = function() {
                    ctx.drawImage(img, element.x, element.y, element.width, element.height);
                };
                img.src = 'data:image/png;base64,' + element.imageData;
            } else if (element.imageUrl) {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = function() {
                    ctx.drawImage(img, element.x, element.y, element.width, element.height);
                };
                img.onerror = function() {
                    // Draw placeholder rectangle if image fails to load
                    ctx.fillStyle = '#cccccc';
                    ctx.fillRect(element.x, element.y, element.width, element.height);
                    ctx.fillStyle = '#666666';
                    ctx.font = '12px Arial';
                    ctx.fillText('Image failed to load', element.x + 5, element.y + 20);
                };
                img.src = element.imageUrl;
            }
            break;
    }
}

// Export as PDF
async function exportPDF() {
    const exportBtn = document.getElementById('exportPdf');
    const originalText = exportBtn.textContent;
    
    // Show loading state
    exportBtn.innerHTML = '<span class="loading"></span>Exporting...';
    exportBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE}/api/canvas/export-pdf`, {
            method: 'POST'
        });
        
        if (response.ok) {
            // Create blob from response
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `canvas-export-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            
            // Cleanup
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showStatus('PDF exported successfully!', 'success');
        } else {
            const errorData = await response.json();
            showStatus(errorData.error || 'Failed to export PDF', 'error');
        }
    } catch (error) {
        showStatus('Error exporting PDF: ' + error.message, 'error');
    } finally {
        // Restore button state
        exportBtn.textContent = originalText;
        exportBtn.disabled = false;
    }
} 