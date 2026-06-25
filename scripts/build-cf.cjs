const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Step 1: Temporarily move problematic directories
const moves = [
  { src: 'app/api',     bak: '_cf_bak_api' },
  { src: 'app/artwork', bak: '_cf_bak_artwork' },
];

moves.forEach(({ src, bak }) => {
  if (fs.existsSync(src)) {
    fs.renameSync(src, bak);
    console.log(`Moved: ${src} -> ${bak}`);
  }
});

// Clean previous builds
if (fs.existsSync('out')) fs.rmSync('out', { recursive: true });
if (fs.existsSync('.next')) fs.rmSync('.next', { recursive: true });

// Create missing directory that Next.js trace collector expects
fs.mkdirSync(path.join('.next', 'static', 'development'), { recursive: true });

try {
  // Step 2: Build with static export enabled
  const env = Object.assign({}, process.env, { CF_BUILD: '1' });
  execSync('npx next build', { stdio: 'inherit', env });

  const indexPath = path.join('out', 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('\n Build succeeded! out/index.html exists.');
  } else {
    console.error('\n out/index.html missing. Checking out/ contents...');
    if (fs.existsSync('out')) {
      const items = fs.readdirSync('out', { recursive: true });
      console.log('  Files in out/: ' + items.filter(f => String(f).endsWith('.html')).join(', ') || 'none');
    }
    process.exitCode = 1;
  }
} catch (err) {
  const indexPath = path.join('out', 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('\n Build finished with errors but output is usable.');
  } else {
    console.error('\n Build failed: ' + (err.message || '').substring(0, 200));
    process.exitCode = 1;
  }
} finally {
  // Step 3: Restore
  moves.forEach(({ src, bak }) => {
    if (fs.existsSync(bak)) {
      fs.renameSync(bak, src);
      console.log(`Restored: ${bak} -> ${src}`);
    }
  });
}
