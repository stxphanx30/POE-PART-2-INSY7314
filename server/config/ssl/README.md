# SSL Certificate Setup

This directory should contain your SSL certificates for HTTPS communication.

## For Development (Self-Signed Certificate)

Generate a self-signed certificate using OpenSSL:

```bash
# Generate private key
openssl genrsa -out server.key 2048

# Generate certificate signing request
openssl req -new -key server.key -out server.csr

# Generate self-signed certificate (valid for 365 days)
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.cert
```

Or use this one-liner:

```bash
openssl req -x509 -newkey rsa:2048 -nodes -keyout server.key -out server.cert -days 365 -subj "/C=ZA/ST=Gauteng/L=Johannesburg/O=Bank/CN=localhost"
```

## For Production

Use a trusted Certificate Authority (CA) like:
- Let's Encrypt (free)
- DigiCert
- Comodo
- GoDaddy

## Required Files

- `server.key` - Private key (keep this secure!)
- `server.cert` - SSL certificate

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit your private key (`server.key`) to version control
- The `.gitignore` file is configured to exclude these files
- Use environment variables to configure paths in production
- Rotate certificates before expiration
- Use strong encryption (minimum 2048-bit RSA)

## Testing SSL

After generating certificates, test your HTTPS server:

```bash
curl -k https://localhost:5000/api/health
```

The `-k` flag allows insecure connections (for self-signed certificates in development).
