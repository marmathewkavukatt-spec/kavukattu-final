#!/usr/bin/env node

/**
 * Server Information Display Script
 * Shows server IP addresses and network information on startup
 */

const os = require('os');
const https = require('https');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
          netmask: iface.netmask,
          mac: iface.mac,
        });
      }
    }
  }

  return addresses;
}

function getPublicIP() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.ipify.org',
      path: '/?format=json',
      method: 'GET',
      timeout: 5000,
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.ip);
        } catch (error) {
          resolve(null);
        }
      });
    });

    req.on('error', () => {
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });

    req.end();
  });
}

async function displayServerInfo() {
  const startTime = new Date();
  
  log('\n' + '='.repeat(60), colors.cyan);
  log('🚀 SERVER INFORMATION', colors.bright + colors.cyan);
  log('='.repeat(60), colors.cyan);

  // Server Details
  log('\n📋 Server Details:', colors.bright + colors.blue);
  log(`   Hostname: ${os.hostname()}`, colors.green);
  log(`   Platform: ${os.platform()} (${os.arch()})`, colors.green);
  log(`   Node Version: ${process.version}`, colors.green);
  log(`   Uptime: ${Math.floor(os.uptime() / 60)} minutes`, colors.green);
  log(`   Started: ${startTime.toLocaleString()}`, colors.green);

  // Environment
  log('\n🌍 Environment:', colors.bright + colors.blue);
  log(`   NODE_ENV: ${process.env.NODE_ENV || 'development'}`, colors.green);
  log(`   Port: ${process.env.PORT || '3000'}`, colors.green);
  log(`   Base URL: ${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}`, colors.green);

  // Local IP Addresses
  log('\n🌐 Local IP Addresses:', colors.bright + colors.blue);
  const localIPs = getLocalIPAddresses();
  
  if (localIPs.length > 0) {
    localIPs.forEach((ip) => {
      log(`   ${ip.interface}: ${ip.address}`, colors.green);
      log(`      Netmask: ${ip.netmask}`, colors.cyan);
      log(`      MAC: ${ip.mac}`, colors.cyan);
    });
  } else {
    log('   No external network interfaces found', colors.yellow);
  }

  // Localhost
  log('\n🏠 Localhost:', colors.bright + colors.blue);
  log(`   IPv4: 127.0.0.1`, colors.green);
  log(`   IPv6: ::1`, colors.green);

  // Public IP (if available)
  log('\n🌍 Public IP Address:', colors.bright + colors.blue);
  log('   Fetching...', colors.yellow);
  
  const publicIP = await getPublicIP();
  
  // Move cursor up and clear line
  process.stdout.write('\x1b[1A\x1b[2K');
  
  if (publicIP) {
    log(`   Public IP: ${publicIP}`, colors.green);
    log(`   Location: https://ipinfo.io/${publicIP}`, colors.cyan);
  } else {
    log('   Unable to fetch public IP (offline or blocked)', colors.yellow);
  }

  // System Resources
  log('\n💻 System Resources:', colors.bright + colors.blue);
  const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
  const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
  const usedMem = (totalMem - freeMem).toFixed(2);
  const memUsage = ((usedMem / totalMem) * 100).toFixed(1);
  
  log(`   CPUs: ${os.cpus().length} cores`, colors.green);
  log(`   Memory: ${usedMem}GB / ${totalMem}GB (${memUsage}% used)`, colors.green);
  log(`   Free Memory: ${freeMem}GB`, colors.green);

  // Load Average (Unix-like systems only)
  if (os.platform() !== 'win32') {
    const loadAvg = os.loadavg();
    log(`   Load Average: ${loadAvg[0].toFixed(2)}, ${loadAvg[1].toFixed(2)}, ${loadAvg[2].toFixed(2)}`, colors.green);
  }

  // Security Status
  log('\n🔒 Security Status:', colors.bright + colors.blue);
  const securityEnabled = process.env.ENABLE_PRODUCTION_SECURITY === 'true';
  const rateLimitEnabled = process.env.RATE_LIMIT_ENABLED === 'true';
  const advancedSecurity = process.env.ENABLE_ADVANCED_SECURITY === 'true';
  
  log(`   Production Security: ${securityEnabled ? '✅ Enabled' : '❌ Disabled'}`, 
      securityEnabled ? colors.green : colors.yellow);
  log(`   Rate Limiting: ${rateLimitEnabled ? '✅ Enabled' : '❌ Disabled'}`, 
      rateLimitEnabled ? colors.green : colors.yellow);
  log(`   Advanced Security: ${advancedSecurity ? '✅ Enabled' : '⚡ Optimized (Disabled)'}`, 
      advancedSecurity ? colors.yellow : colors.green);

  // Access URLs
  log('\n🔗 Access URLs:', colors.bright + colors.blue);
  const port = process.env.PORT || '3000';
  
  log(`   Local: http://localhost:${port}`, colors.green);
  
  if (localIPs.length > 0) {
    localIPs.forEach((ip) => {
      log(`   Network (${ip.interface}): http://${ip.address}:${port}`, colors.green);
    });
  }
  
  if (process.env.NEXT_PUBLIC_BASE_URL && process.env.NEXT_PUBLIC_BASE_URL !== 'http://localhost:3000') {
    log(`   Production: ${process.env.NEXT_PUBLIC_BASE_URL}`, colors.green);
  }

  log('\n' + '='.repeat(60), colors.cyan);
  log('✅ Server information displayed successfully', colors.bright + colors.green);
  log('='.repeat(60) + '\n', colors.cyan);
}

// Run the script
displayServerInfo().catch((error) => {
  console.error('Error displaying server info:', error);
  process.exit(1);
});
