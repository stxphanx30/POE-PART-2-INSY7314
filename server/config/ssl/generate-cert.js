const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Generating self-signed SSL certificate...\n');

// Check if files already exist
const certPath = path.join(__dirname, 'server.cert');
const keyPath = path.join(__dirname, 'server.key');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✓ SSL certificates already exist!');
  console.log('  Certificate:', certPath);
  console.log('  Private Key:', keyPath);
  process.exit(0);
}

// Try to use openssl if available
try {
  execSync('openssl version', { stdio: 'ignore' });
  
  // Generate with openssl
  const command = `openssl req -x509 -newkey rsa:2048 -nodes -keyout "${keyPath}" -out "${certPath}" -days 365 -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"`;
  execSync(command, { stdio: 'inherit' });
  
  console.log('\n✓ SSL certificates generated successfully!');
  console.log('  Certificate:', certPath);
  console.log('  Private Key:', keyPath);
} catch (error) {
  console.log('⚠ OpenSSL not found. Creating placeholder certificates...\n');
  console.log('For production, you should generate proper SSL certificates.');
  console.log('For now, the server will start in HTTP mode (development only).\n');
  
  // Create placeholder files
  fs.writeFileSync(certPath, '# Placeholder certificate file\n# Generate proper SSL certificates for production');
  fs.writeFileSync(keyPath, '# Placeholder key file\n# Generate proper SSL certificates for production');
  
  console.log('✓ Placeholder files created.');
  console.log('  The server will run in HTTP mode on port 5000');
}
