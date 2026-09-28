const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const indexHtml = path.join(distDir, 'index.html');

if (!fs.existsSync(indexHtml)) {
  console.error('dist/index.html not found! Run vite build first.');
  process.exit(1);
}

const content = fs.readFileSync(indexHtml, 'utf8');

const routes = [
  'login',
  'register/donor',
  'register/recipient',
  'donor',
  'recipient',
  'admin',
  'map',
  'peta',
  'contact',
  'support',
  'forgot-password',
  'reset-password'
];

routes.forEach((route) => {
  const targetDir = path.join(distDir, route);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), content);
  fs.writeFileSync(path.join(distDir, `${route.replace(/\//g, '_')}.html`), content);
});

// Also create 200.html and 404.html
fs.writeFileSync(path.join(distDir, '200.html'), content);
fs.writeFileSync(path.join(distDir, '404.html'), content);

console.log('SPA static route fallbacks successfully generated for Vercel!');
