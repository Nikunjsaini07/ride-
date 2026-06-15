// Frees the configured PORT before the server starts, so a leftover process
// never causes EADDRINUSE. Cross-platform, no external dependencies.
import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();
const port = process.env.PORT || 5000;

// In production (Render/hosted), each instance owns its port — nothing to free.
if (process.env.NODE_ENV === "production") {
  process.exit(0);
}

try {
  if (process.platform === "win32") {
    const out = execSync(`netstat -ano -p tcp`).toString();
    const pids = new Set();
    out
      .split(/\r?\n/)
      .filter((l) => l.includes(`:${port} `) && /LISTENING/i.test(l))
      .forEach((l) => {
        const pid = l.trim().split(/\s+/).pop();
        if (pid && pid !== "0") pids.add(pid);
      });
    pids.forEach((pid) => {
      try {
        execSync(`taskkill /F /PID ${pid}`);
        console.log(`Freed port ${port} (killed PID ${pid})`);
      } catch {
        /* already gone */
      }
    });
  } else {
    const pids = execSync(`lsof -ti tcp:${port} || true`).toString().trim();
    if (pids) {
      execSync(`kill -9 ${pids.split(/\s+/).join(" ")}`);
      console.log(`Freed port ${port}`);
    }
  }
} catch {
  // Nothing listening (or command unavailable) — safe to continue.
}
