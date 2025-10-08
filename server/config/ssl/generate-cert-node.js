const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

console.log('Generating self-signed SSL certificate...\n');

const attrs = [
  { name: 'commonName', value: 'localhost' },
  { name: 'countryName', value: 'ZA' },
  { name: 'stateOrProvinceName', value: 'Gauteng' },
  { name: 'localityName', value: 'Johannesburg' },
  { name: 'organizationName', value: 'Bank' }
];

const options = {
  keySize: 2048,
  days: 365,
  algorithm: 'sha256',
  extensions: [
    {
      name: 'basicConstraints',
      cA: true
    },
    {
      name: 'keyUsage',
      keyCertSign: true,
      digitalSignature: true,
      nonRepudiation: true,
      keyEncipherment: true,
      dataEncipherment: true
    },
    {
      name: 'extKeyUsage',
      serverAuth: true,
      clientAuth: true,
      codeSigning: true,
      timeStamping: true
    },
    {
      name: 'subjectAltName',
      altNames: [
        {
          type: 2,
          value: 'localhost'
        },
        {
          type: 7,
          ip: '127.0.0.1'
        }
      ]
    }
  ]
};

const pems = selfsigned.generate(attrs, options);

const certPath = path.join(__dirname, 'server.cert');
const keyPath = path.join(__dirname, 'server.key');

fs.writeFileSync(certPath, pems.cert);
fs.writeFileSync(keyPath, pems.private);

console.log('✓ SSL certificates generated successfully!\n');
console.log('  Certificate:', certPath);
console.log('  Private Key:', keyPath);
console.log('\nNote: This is a self-signed certificate for development only.');
console.log('Your browser will show a security warning - this is normal.\n');
