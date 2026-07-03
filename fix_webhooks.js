const fs = require('fs');
const path = require('path');

const webhooksDir = './src/app/api/webhooks';
const integrations = fs.readdirSync(webhooksDir).filter(f => fs.statSync(path.join(webhooksDir, f)).isDirectory());

integrations.forEach(integration => {
  const routePath = path.join(webhooksDir, integration, 'route.ts');
  if (fs.existsSync(routePath)) {
    let content = fs.readFileSync(routePath, 'utf8');
    
    // Check if it already has account_secrets logic
    if (!content.includes('account_secrets')) {
      // Step 1: Remove integration_secrets from accounts select
      content = content.replace(/.select\(['`]?([^'`)]+)['`]?\)/, (match, p1) => {
        return `.select('${p1.replace('integration_secrets, ', '').replace('integration_secrets', '')}')`;
      });
      
      // Step 2: Find where the secret is extracted
      const secretRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*account\.integration_secrets\?\.(?:\[['"]|)([a-zA-Z0-9_]+)(?:['"]\]|);/;
      const match = content.match(secretRegex);
      
      if (match) {
        const varName = match[1];
        const secretKey = match[2];
        
        const fetchSecretsCode = `
    const { data: secretData } = await supabase
      .from('account_secrets')
      .select('secrets')
      .eq('account_id', accountId)
      .single();

    const ${varName} = secretData?.secrets?.${secretKey === '3dcart_secret' ? "['3dcart_secret']" : secretKey};`;
        
        content = content.replace(match[0], fetchSecretsCode.trim());
        fs.writeFileSync(routePath, content);
        console.log(`Fixed ${integration}`);
      }
    }
  }
});
