#!/usr/bin/env node

/**
 * Startup Information Script
 * Displays server IP and configuration on server startup
 * This runs automatically when the server starts
 */

const os = require('os');
const fs = require("node:fs");
const path = require("node:path");

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

function ensureNextDevArtifacts() {
  try {
    const root = process.cwd();
    const nextDir = path.join(root, ".next");

    if (!fs.existsSync(nextDir)) return;

    const isDev = (process.env.NODE_ENV || "development") !== "production";
    if (!isDev) return;

    const hasMiddleware =
      fs.existsSync(path.join(root, "middleware.ts")) ||
      fs.existsSync(path.join(root, "src", "middleware.ts"));

    const middlewareManifest = path.join(nextDir, "server", "middleware-manifest.json");

    // If middleware exists but the manifest is missing, .next is incomplete/corrupt.
    if (hasMiddleware && !fs.existsSync(middlewareManifest)) {
      log(
        "\n[dev] Detected missing .next/server/middleware-manifest.json. Cleaning .next to force a rebuild...",
        colors.yellow,
      );
      fs.rmSync(nextDir, { recursive: true, force: true });
      log("[dev] Cleaned .next directory.", colors.green);
      return;
    }

    // Detect broken/incomplete .next server chunks (common on Windows when a dev build is interrupted).
    const webpackRuntimePath = path.join(nextDir, "server", "webpack-runtime.js");
    if (fs.existsSync(webpackRuntimePath)) {
      const runtime = fs.readFileSync(webpackRuntimePath, "utf8");
      const required = new Set();
      const re = /require\((['"])\.\/([^'"]+?)\1\)/g;
      let match;
      while ((match = re.exec(runtime))) {
        const requested = match[2];
        // Only validate plain sibling requires like "./8948.js"
        if (!requested || requested.includes("/") || requested.includes("\\")) continue;
        required.add(requested);
      }

      const missing = [];
      for (const file of required) {
        const candidate = path.join(nextDir, "server", file);
        if (!fs.existsSync(candidate)) missing.push(file);
      }

      if (missing.length > 0) {
        log(
          `\n[dev] Detected missing .next/server files referenced by webpack runtime (${missing.slice(0, 3).join(", ")}${missing.length > 3 ? ", ..." : ""}). Cleaning .next to force a rebuild...`,
          colors.yellow,
        );
        fs.rmSync(nextDir, { recursive: true, force: true });
        log("[dev] Cleaned .next directory.", colors.green);
      }
    }
  } catch (err) {
    log(
      `\n[dev] Unable to validate/clean .next directory: ${err && err.message ? err.message : String(err)}`,
      colors.yellow,
    );
  }
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
ensureNextDevArtifacts();
displayStartupInfo();
