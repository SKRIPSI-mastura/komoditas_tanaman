const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'stitch_output');
const destDir = __dirname;

const filesMap = {
  '2_Login_Admin.html': 'index.html',
  '3_Dashboard_Admin.html': 'dashboard.html',
  '4_Proses_LSTM_Rekomendasi.html': 'proses-lstm.html',
  '5_Kelola_Data_Pendukung.html': 'kelola-data.html',
  '6_Hasil_Rekomendasi_Varietas.html': 'hasil-rekomendasi.html'
};

try {
  for (const [srcFile, destFile] of Object.entries(filesMap)) {
    const srcPath = path.join(srcDir, srcFile);
    if (!fs.existsSync(srcPath)) {
      console.warn(`File not found: ${srcPath}`);
      continue;
    }

    let content = fs.readFileSync(srcPath, 'utf8');

    // Remove the inline tailwind-config script since we have styles.css now
    // Actually, keeping tailwind is fine since it's used for layout, our CSS just defines variables.
    // Let's just inject the link before </head>
    
    // Some basic replacements if needed, but mainly we inject CSS
    if (content.includes('</head>')) {
      content = content.replace('</head>', '  <link rel="stylesheet" href="css/styles.css">\n</head>');
    } else {
      // Just in case there's no </head>
      content += '\n<link rel="stylesheet" href="css/styles.css">';
    }

    fs.writeFileSync(path.join(destDir, destFile), content);
    console.log(`Processed: ${srcFile} -> ${destFile}`);
  }

  console.log('HTML files normalized and moved successfully.');
} catch (e) {
  console.error(e);
}
