const fs = require('fs');
const path = require('path');

// Get all HTML files
const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));

// Security meta tags to add
const securityMetaTags = `
    <!-- Security Meta Tags -->
    <meta name="robots" content="noindex,nofollow,noarchive" />
    <meta name="googlebot" content="noindex,nofollow,noarchive" />
    <meta name="bingbot" content="noindex,nofollow,noarchive" />
    <meta http-equiv="X-Frame-Options" content="DENY" />
    <meta http-equiv="X-Content-Type-Options" content="nosniff" />
    <meta http-equiv="X-XSS-Protection" content="1; mode=block" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self';" />
    <meta name="referrer" content="no-referrer" />
    <meta http-equiv="Cache-Control" content="no-store, no-cache, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />
`;

// Process each HTML file
htmlFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove any existing robots meta tag
    content = content.replace(/<meta[^>]*robots[^>]*>/gi, '');
    
    // Add security meta tags after the first <head> tag
    content = content.replace(/<head>/i, `<head>\n${securityMetaTags}`);
    
    // Write the modified content back
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
