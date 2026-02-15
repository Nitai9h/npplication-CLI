import fs from 'fs';
import path from 'path';
import selfsigned from 'selfsigned';

const CERT_DIR = path.join(process.cwd(), '.certs');
const CERT_PATH = path.join(CERT_DIR, 'cert.pem');
const KEY_PATH = path.join(CERT_DIR, 'key.pem');

export async function createSelfSignedCertificate(): Promise<{ cert: string; key: string }> {
    if (!fs.existsSync(CERT_DIR)) {
        fs.mkdirSync(CERT_DIR, { recursive: true });
    }

    if (fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH)) {
        return {
            cert: fs.readFileSync(CERT_PATH, 'utf-8'),
            key: fs.readFileSync(KEY_PATH, 'utf-8')
        };
    }

    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = await selfsigned.generate(attrs, {
        keySize: 2048,
        extensions: [
            {
                name: 'basicConstraints',
                cA: false
            },
            {
                name: 'keyUsage',
                digitalSignature: true,
                keyEncipherment: true
            },
            {
                name: 'extKeyUsage',
                serverAuth: true
            },
            {
                name: 'subjectAltName',
                altNames: [
                    { type: 2, value: 'localhost' },
                    { type: 7, ip: '127.0.0.1' }
                ]
            }
        ]
    });

    fs.writeFileSync(CERT_PATH, pems.cert);
    fs.writeFileSync(KEY_PATH, pems.private);

    return {
        cert: pems.cert,
        key: pems.private
    };
}
