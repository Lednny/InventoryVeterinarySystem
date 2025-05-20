const fs = require("fs");
const dotenv = require("dotenv");

dotenv.config();

const targetDir = "./src/environments";

fs.mkdirSync(targetDir, { recursive: true });
console.log(`\'${targetDir}\' dir created!`);

const envInfo = [
  {
    // Development
    path: `${targetDir}/environment.ts`,
    envConfig: `\
    export const environment = {
      production: true,
      SUPABASE_URL: '${process.env.SUPABASE_URL}',
      SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
    };
    `,
  },
  {
    // Production
    path: `${targetDir}/environment.development.ts`,
    envConfig: `\
    export const environment = {
      production: false,
      SUPABASE_URL: '${process.env.SUPABASE_URL}',
      SUPABASE_ANON_KEY: '${process.env.SUPABASE_ANON_KEY}'
    };
    `,
  },
];

for (let { path, envConfig } of envInfo) {
  fs.writeFileSync(path, envConfig);
  console.log(`\'${path}\' file created!`);
}
