const fs = require('fs');
const path = require('path');

const webhooksDir = './src/app/api/webhooks';
const integrations = fs.readdirSync(webhooksDir).filter(f => fs.statSync(path.join(webhooksDir, f)).isDirectory());

integrations.forEach(integration => {
  const routePath = path.join(webhooksDir, integration, 'route.ts');
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');
    
    // Determine the variable name for Supabase client
    let supabaseVar = 'supabase';
    if (content.includes('const supabaseAdmin = createClient')) {
      supabaseVar = 'supabaseAdmin';
    } else if (content.includes('const supabase = createClient')) {
      supabaseVar = 'supabase';
    } else {
      console.log(`Could not determine supabase var for ${integration}`);
    }
    
    // Replace 'await supabase.from(\'account_secrets\')' with the correct var
    if (supabaseVar === 'supabaseAdmin') {
      content = content.replace(/await\s+supabase\s*\.\s*from\('account_secrets'\)/g, `await supabaseAdmin.from('account_secrets')`);
      fs.writeFileSync(routePath, content);
      console.log(`Fixed supabase var for ${integration}`);
    }
  }
});
