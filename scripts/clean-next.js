const fs = require('fs');
const path = require('path');

const targets = process.argv.slice(2);
const dirs = targets.length > 0 ? targets : ['.next'];

dirs.forEach(dir => {
  const targetDir = path.join(process.cwd(), dir);

  try {
    fs.rmSync(targetDir, { recursive: true, force: true });
    console.log(`Cleaned ${dir} cache.`);
  } catch (error) {
    console.warn(`Could not clean ${dir} cache:`, error.message);
  }
});
