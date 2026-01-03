// ============================================
// TUNNEL BAŞLATMA SCRIPTİ (ngrok, cloudflare, vs.)
// ============================================
// Kullanım: node start-tunnel.js

const { spawn } = require('child_process');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const TUNNEL_TYPE = process.env.TUNNEL_TYPE || 'ngrok'; // ngrok, cloudflare, localtunnel

console.log('🌍 Tunnel başlatılıyor...');
console.log(`📡 Port: ${PORT}`);
console.log(`🔧 Tip: ${TUNNEL_TYPE}\n`);

let tunnelProcess;

if (TUNNEL_TYPE === 'ngrok') {
  // ngrok kullanımı
  console.log('💡 ngrok kurulumu: npm install -g ngrok');
  console.log('💡 ngrok kullanımı: ngrok http 3000\n');
  
  tunnelProcess = spawn('ngrok', ['http', PORT.toString()], {
    stdio: 'inherit',
    shell: true
  });
  
} else if (TUNNEL_TYPE === 'cloudflare') {
  // Cloudflare Tunnel kullanımı
  console.log('💡 cloudflared kurulumu: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
  console.log('💡 cloudflared kullanımı: cloudflared tunnel --url http://localhost:3000\n');
  
  tunnelProcess = spawn('cloudflared', ['tunnel', '--url', `http://localhost:${PORT}`], {
    stdio: 'inherit',
    shell: true
  });
  
} else if (TUNNEL_TYPE === 'localtunnel') {
  // localtunnel kullanımı
  console.log('💡 localtunnel kurulumu: npm install -g localtunnel');
  console.log('💡 localtunnel kullanımı: lt --port 3000\n');
  
  tunnelProcess = spawn('lt', ['--port', PORT.toString()], {
    stdio: 'inherit',
    shell: true
  });
  
} else {
  console.error('❌ Bilinmeyen tunnel tipi:', TUNNEL_TYPE);
  console.log('💡 Desteklenen: ngrok, cloudflare, localtunnel');
  process.exit(1);
}

tunnelProcess.on('error', (error) => {
  console.error('❌ Tunnel başlatma hatası:', error.message);
  console.log('\n💡 Tunnel aracını kurduğunuzdan emin olun:');
  console.log('   - ngrok: npm install -g ngrok');
  console.log('   - cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/');
  console.log('   - localtunnel: npm install -g localtunnel');
});

tunnelProcess.on('exit', (code) => {
  console.log(`\n⚠️  Tunnel kapatıldı (kod: ${code})`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⚠️  Tunnel kapatılıyor...');
  tunnelProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⚠️  Tunnel kapatılıyor...');
  tunnelProcess.kill();
  process.exit(0);
});

