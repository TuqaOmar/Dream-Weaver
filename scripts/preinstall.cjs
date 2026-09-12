const fs = require('fs');
['package-lock.json', 'yarn.lock'].forEach(f => {
  try { fs.rmSync(f, { force: true }); } catch (e) {}
});
if (!/pnpm/.test(process.env.npm_config_user_agent || '')) {
  console.error('Use pnpm instead');
  process.exit(1);
}