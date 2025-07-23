const fs = require('fs');
const envPath = './src/environments/environment.prod.ts';

const content = `
export const environment = {
    production: true,
    SUPABASE_URL: '${process.env.SUPABASE_URL}',
    SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
};
`;

fs.writeFileSync(envPath, content);
console.log('environment.prod.ts generado correctamente');