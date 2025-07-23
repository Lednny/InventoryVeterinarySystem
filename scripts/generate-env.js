
const fs = require('fs');
const path = require('path');
const envDir = './src/environments';
const envProdPath = path.join(envDir, 'environment.prod.ts');
const envDevPath = path.join(envDir, 'environment.ts');

// Crear la carpeta si no existe
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}


const prodContent = `
export const environment = {
  production: true,
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
};
`;

const devContent = `
export const environment = {
  production: false,
  SUPABASE_URL: '${process.env.SUPABASE_URL}',
  SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
};
`;

fs.writeFileSync(envProdPath, prodContent);
console.log('environment.prod.ts generado correctamente');
fs.writeFileSync(envDevPath, devContent);
console.log('environment.ts generado correctamente');