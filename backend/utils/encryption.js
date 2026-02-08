const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const key = crypto.scryptSync(process.env.JWT_SECRET || 'fallback_secret', 'salt', 32);
const iv = Buffer.alloc(16, 0); // In a real production app, use a unique IV per entry

const encrypt = (text) => {
    if (!text) return text;
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};

const decrypt = (text) => {
    if (!text) return text;
    try {
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        let decrypted = decipher.update(text, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return text; // Return as is if decryption fails (e.g., not encrypted)
    }
};

module.exports = { encrypt, decrypt };
