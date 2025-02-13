const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 3000;
const domain = process.env.DOMAIN || 'http://localhost';

// Step 1: Install Python dependencies from Flask/requirements.txt
exec('pip install -r Flask/requirements.txt', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error installing dependencies: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`stderr: ${stderr}`);
    }
    console.log(`Dependencies installed:\n${stdout}`);

    // Step 2: Start the Express server after installing dependencies
    app.use(express.static(__dirname));

    console.log(`Website will be deployed at ${domain}:${port}`);

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'index.html'));
    });

    app.listen(port, () => {
        console.log(`Server is running on ${domain}:${port}`);
    });
});
