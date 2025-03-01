const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();

// Define the port and domain
const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || 'http://localhost'; // Default to localhost if DOMAIN is not set

// Ensure 'savedfile' directory exists
const savedFilePath = path.join(__dirname, 'savedfile');
if (!fs.existsSync(savedFilePath)) {
    fs.mkdirSync(savedFilePath, { recursive: true });
}

// Serve everything (static files + uploaded files) from 'savedfile'
app.use('/savedfile', express.static(savedFilePath));

// Multer configuration for file uploads
const upload = multer({ dest: savedFilePath });

// Handle file uploads
app.post('/upload', upload.single('session_file'), (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const newPath = path.join(savedFilePath, fileName);

    fs.rename(filePath, newPath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'File save failed.' });
        }
        res.json({ message: 'File uploaded successfully!', url: `${domain}/savedfile/${fileName}` });
    });
});

// Log the domain when the server starts
console.log(`Website will be deployed at ${domain}:${port}`);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on ${domain}:${port}`);
});
