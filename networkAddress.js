const os = require('os');

// ฟังก์ชันเพื่อดึงที่อยู่ IP เครือข่ายท้องถิ่น
function getNetworkAddress() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      const { address, family, internal } = iface;
      if (family === 'IPv4' && !internal) {
        return address;
      }
    }
  }
}

const localAddress = 'localhost';
const networkAddress = getNetworkAddress();

module.exports = { localAddress, networkAddress };
