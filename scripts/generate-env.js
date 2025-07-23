
const fs = require('fs');
const path = require('path');
const envDir = './src/environments';
const envPath = path.join(envDir, 'environment.prod.ts');

// Crear la carpeta si no existe
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}

const content = `
export const environment = {
  production: true,
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
};
`;

fs.writeFileSync(envPath, content);
console.log('environment.prod.ts generado correctamente');