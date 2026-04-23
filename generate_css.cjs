const fs = require('fs');
const path = require('path');

try {
  const dsPath = path.join(__dirname, 'stitch_output', '1_Design_System.json');
  const ds = JSON.parse(fs.readFileSync(dsPath, 'utf8'));

  const theme = ds.designSystem.theme;
  const colors = theme.namedColors;

  let css = '/* Emerald Field Admin Design System */\n';
  css += ':root {\n';
  for (const [key, value] of Object.entries(colors)) {
    css += `  --color-${key.replace(/_/g, '-')}: ${value};\n`;
  }

  css += `\n  /* Typography */\n`;
  css += `  --font-headline: ${theme.headlineFont === 'MANROPE' ? "'Manrope', sans-serif" : 'sans-serif'};\n`;
  css += `  --font-body: ${theme.bodyFont === 'INTER' ? "'Inter', sans-serif" : 'sans-serif'};\n`;
  css += `  --font-label: ${theme.labelFont === 'INTER' ? "'Inter', sans-serif" : 'sans-serif'};\n`;
  css += `}\n\n`;

  css += `body {\n  background-color: var(--color-background);\n  color: var(--color-on-background);\n  font-family: var(--font-body);\n  margin: 0;\n  padding: 0;\n}\n\n`;
  css += `h1, h2, h3, h4, h5, h6 {\n  font-family: var(--font-headline);\n}\n`;

  const cssDir = path.join(__dirname, 'css');
  if (!fs.existsSync(cssDir)) {
    fs.mkdirSync(cssDir, { recursive: true });
  }

  fs.writeFileSync(path.join(cssDir, 'styles.css'), css);
  console.log('styles.css generated successfully');
} catch (e) {
  console.error(e);
}
