import https from 'https';

const checkSSL = (domain) => {
  return new Promise((resolve, reject) => {
    const options = {
      host: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: false,
    };

    const req = https.request(options, (res) => {
      const cert = res.connection.getPeerCertificate();
      
      if (res.socket.authorized) {
        resolve({
          domain,
          validFrom: new Date(cert.valid_from),
          validTo: new Date(cert.valid_to),
          issuer: cert.issuer.O,
          status: 'Valid',
        });
      } else if (cert.subject) {
        resolve({
          domain,
          validFrom: new Date(cert.valid_from),
          validTo: new Date(cert.valid_to),
          issuer: cert.issuer.O,
          status: 'Invalid',
        });
      } else {
        reject(new Error('No SSL certificate'));
      }
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

export { checkSSL };