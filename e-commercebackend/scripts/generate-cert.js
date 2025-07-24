const fs = require('fs');
const path = require('path');
const selfsigned = require('selfsigned');

const certDir = path.join(__dirname, '../cert');
const keyPath = path.join(certDir, 'localhost-key.pem');
const certPath = path.join(certDir, 'localhost.pem');

console.log('🔐 Generating SSL certificates for local development...\n');

// Create cert directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`✅ Created directory: ${certDir}`);
}

// Check if certificates already exist
// if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
//   console.log('ℹ️  SSL certificates already exist.');
//   console.log(`   Key: ${keyPath}`);
//   console.log(`   Cert: ${certPath}`);
//   process.exit(0);
// }

try {
  console.log('🔑 Generating private key and certificate...');

  // Generate a self-signed certificate
  const pems = selfsigned.generate(
    // [
    //   { name: 'commonName', value: 'localhost' },
    //   { name: 'organizationName', value: 'Local Development' },
    //   { name: 'countryName', value: 'US' }
    // ],

    [
      { name: 'commonName', value: 'Priyanka' },
      { name: 'organizationName', value: 'Prashansa' },
      { name: 'countryName', value: 'NP' }
    ],
    {
      keySize: 2048,
      days: 365,
      algorithm: 'sha256',
      extensions: [
        { name: 'basicConstraints', cA: true },
        { name: 'keyUsage', keyCertSign: true, digitalSignature: true, nonRepudiation: true, keyEncipherment: true, dataEncipherment: true },
        {
          name: 'subjectAltName', altNames: [
            { type: 2, value: 'localhost' },
            { type: 7, ip: '127.0.0.1' }
          ]
        }
      ]
    }
  );

  // Save the private key and certificate
  fs.writeFileSync(keyPath, pems.private);
  fs.writeFileSync(certPath, pems.cert);

  console.log('\n🎉 SSL certificates generated successfully!');
  console.log(`🔑 Private key: ${keyPath}`);
  console.log(`📜 Certificate: ${certPath}`);
  console.log('\nYou can now start the server with HTTPS enabled.');
  console.log('Run: npm run dev:https\n');

} catch (error) {
  console.error('❌ Error generating SSL certificates:', error);
  process.exit(1);
}


