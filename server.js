require('dotenv').config();
const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const cors = require('cors');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

app.use(cors());

// Add security headers
app.use((req, res, next) => {
    // Prevent search engine indexing
    res.setHeader('X-Robots-Tag', 'noindex,nofollow,noarchive');
    
    // Security headers
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // CSP headers
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:");
    
    next();
});

app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('X-Robots-Tag', 'noindex,nofollow,noarchive');
        }
    }
}));

// Initialize Google Sheets document
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);

async function initializeGoogleSheet() {
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await doc.loadInfo();
}

// API endpoint to get provider data
app.get('/api/provider-data', async (req, res) => {
    try {
        // Check cache first
        const cachedData = cache.get('providerData');
        if (cachedData) {
            return res.json(cachedData);
        }

        // If not in cache, fetch from Google Sheets
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        const rows = await sheet.getRows();
        
        const providerData = rows.map(row => ({
            provider: row.provider,
            plan: row.plan,
            price: row.price,
            speed: row.speed,
            features: row.features,
        }));

        // Store in cache
        cache.set('providerData', providerData);
        
        res.json(providerData);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch provider data' });
    }
});

// Initialize and start server
const PORT = process.env.PORT || 3000;

initializeGoogleSheet().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}).catch(console.error);
