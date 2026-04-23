/* eslint-disable no-console */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function runNextBuild() {
  return new Promise((resolve) => {
    let nextBin;
    try {
      nextBin = require.resolve("next/dist/bin/next");
    } catch (err) {
      console.error("[build] Unable to resolve Next.js binary:", err);
      resolve({ code: 1, stderr: String(err) });
      return;
    }

    const child = spawn(process.execPath, [nextBin, "build"], {
      stdio: ["inherit", "pipe", "pipe"],
      shell: false,
    });

    let stderr = "";

    child.stdout.on("data", (chunk) => process.stdout.write(chunk));
    child.stderr.on("data", (chunk) => {
      const text = chunk.toString();
      stderr += text;
      process.stderr.write(chunk);
    });

    child.on("error", (err) => {
      stderr += String(err);
      resolve({ code: 1, stderr });
    });

    child.on("close", (code) => {
      resolve({ code: code ?? 1, stderr });
    });
  });
}

function safeRm(targetPath) {
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

function isNftJsonEnoent(stderr) {
  return (
    stderr.includes("collect-build-traces.js") &&
    stderr.includes("ENOENT") &&
    stderr.includes(".nft.json")
  );
}

async function main() {
  const first = await runNextBuild();
  if (first.code === 0) {
    process.exit(0);
  }

  if (!isNftJsonEnoent(first.stderr)) {
    process.exit(first.code);
  }

  console.warn(
    "\n[build] Detected intermittent Windows ENOENT for .nft.json. Cleaning .next and retrying once...\n",
  );

  safeRm(path.join(process.cwd(), ".next"));

  const second = await runNextBuild();
  process.exit(second.code);
}

main().catch((err) => {
  console.error("[build] Unexpected error:", err);
  process.exit(1);
});
