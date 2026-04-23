#!/usr/bin/env node

/**
 * Startup Information Script
 * Displays server IP and configuration on server startup
 * This runs automatically when the server starts
 */

const os = require('os');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function getLocalIPAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          address: iface.address,
        });
      }
    }
  }

  return addresses;
}

function displayStartupInfo() {
  const port = process.env.PORT || '3000';
  const env = process.env.NODE_ENV || 'development';
  const localIPs = getLocalIPAddresses();

  log('\n' + '━'.repeat(60), colors.cyan);
  log('🚀 SERVER STARTING', colors.bright + colors.cyan);
  log('━'.repeat(60), colors.cyan);

  log(`\n📍 Server IP Addresses:`, colors.bright + colors.blue);
  log(`   Localhost: http://localhost:${port}`, colors.green);
  log(`   Localhost: http://127.0.0.1:${port}`, colors.green);
  
  if (localIPs.length > 0) {
    localIPs.forEach((ip) => {
      log(`   Network (${ip.interface}): http://${ip.address}:${port}`, colors.green);
    });
  }

  log(`\n⚙️  Configuration:`, colors.bright + colors.blue);
  log(`   Environment: ${env}`, colors.green);
  log(`   Hostname: ${os.hostname()}`, colors.green);
  log(`   Platform: ${os.platform()}`, colors.green);
  
  const securityOptimized = process.env.ENABLE_ADVANCED_SECURITY !== 'true';
  log(`   Security: ${securityOptimized ? '⚡ Optimized' : '🔒 Full'}`, 
      securityOptimized ? colors.green : colors.yellow);

  log('\n' + '━'.repeat(60) + '\n', colors.cyan);
}

// Run immediately
displayStartupInfo();
