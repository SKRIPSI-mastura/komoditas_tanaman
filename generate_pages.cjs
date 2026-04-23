const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'stitch_output');
const appDir = path.join(__dirname, 'app');

const filesMap = {
  '2_Login_Admin.html': 'login',
  '3_Dashboard_Admin.html': 'dashboard',
  '4_Proses_LSTM_Rekomendasi.html': 'proses-lstm',
  '5_Kelola_Data_Pendukung.html': 'kelola-data',
  '6_Hasil_Rekomendasi_Varietas.html': 'hasil-rekomendasi'
};

function convertHtmlToJsx(html) {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return '';
  let jsx = bodyMatch[1];
  
  const bodyTagMatch = html.match(/<body([^>]*)>/i);
  const bodyClass = bodyTagMatch ? bodyTagMatch[1] : '';

  // Replace class=" with className="
  jsx = jsx.replace(/class="/g, 'className="');
  
  // Replace for=" with htmlFor="
  jsx = jsx.replace(/for="/g, 'htmlFor="');
  
  // Replace HTML comments with JSX comments
  jsx = jsx.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

  // Self-closing tags
  jsx = jsx.replace(/<img([^>]*?)(?:\/?)>/g, (match, p1) => {
    if (p1.trim().endsWith('/')) return match;
    return `<img${p1} />`;
  });
  
  jsx = jsx.replace(/<input([^>]*?)(?:\/?)>/g, (match, p1) => {
    if (p1.trim().endsWith('/')) return match;
    return `<input${p1} />`;
  });
  
  jsx = jsx.replace(/<br(?:[^>]*)>/g, '<br />');
  jsx = jsx.replace(/<hr(?:[^>]*)>/g, '<hr />');

  // SVG attributes to camelCase
  jsx = jsx.replace(/stroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/stroke-dasharray="/g, 'strokeDasharray="');
  jsx = jsx.replace(/stroke-dashoffset="/g, 'strokeDashoffset="');

  // Any style strings like style="background-image: ..." need to be replaced with style objects
  // This might be tricky via regex, so we'll just fix the single known style="background-image: radial-gradient(#005137 1px, transparent 1px); background-size: 20px 20px;"
  jsx = jsx.replace(
      /style="background-image: radial-gradient\(#005137 1px, transparent 1px\); background-size: 20px 20px;"/g,
      "style={{ backgroundImage: 'radial-gradient(#005137 1px, transparent 1px)', backgroundSize: '20px 20px' }}"
  );

  return { jsx, bodyClass };
}

try {
  for (const [srcFile, route] of Object.entries(filesMap)) {
    const srcPath = path.join(srcDir, srcFile);
    if (!fs.existsSync(srcPath)) continue;

    const content = fs.readFileSync(srcPath, 'utf8');
    let { jsx, bodyClass } = convertHtmlToJsx(content);
    
    // Process body class to className string
    let wrapperClass = '';
    const classMatch = bodyClass.match(/className="([^"]+)"/);
    if (!classMatch) {
       const oclass = bodyClass.match(/class="([^"]+)"/);
       if(oclass) wrapperClass = oclass[1];
    } else {
       wrapperClass = classMatch[1];
    }

    const pageContent = `export default function Page() {
  return (
    <div className="${wrapperClass}">
      ${jsx}
    </div>
  );
}
`;

    const routeDir = path.join(appDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }

    fs.writeFileSync(path.join(routeDir, 'page.tsx'), pageContent);
    console.log(`Converted ${srcFile} -> app/${route}/page.tsx`);
  }
} catch (e) {
  console.error(e);
}
