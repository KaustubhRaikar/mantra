const { spawn } = require('child_process');

async function runMcpOperation(operation, params = {}) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    delete env.HOSTINGER_API_TOKEN;

    const p = spawn('npx.cmd', ['--package=@hostinger/mcp@latest', 'hostinger-hosting-mcp', '--stdio'], {
      shell: true,
      env
    });

    let buffer = '';
    let resolved = false;

    p.stdout.on('data', d => {
      buffer += d.toString();
      const lines = buffer.split('\n');
      buffer = lines.pop();
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const msg = JSON.parse(line);
          if (msg.id === 1) {
            const isSearch = operation === 'search';
            const callReq = JSON.stringify({
              jsonrpc: '2.0',
              id: 2,
              method: 'tools/call',
              params: {
                name: isSearch ? 'search' : 'execute',
                arguments: isSearch ? params : { operation, params }
              }
            }) + '\n';
            p.stdin.write(callReq);
          } else if (msg.id === 2) {
            resolved = true;
            resolve(msg.result);
            setTimeout(() => p.kill(), 500);
          }
        } catch (e) {}
      }
    });

    p.stderr.on('data', d => {});

    p.on('error', err => {
      if (!resolved) reject(err);
    });

    p.on('exit', code => {
      if (!resolved) resolve({ exitCode: code });
    });

    // Initialize MCP
    const initReq = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'cli', version: '1.0' } }
    }) + '\n';
    p.stdin.write(initReq);

    setTimeout(() => {
      if (!resolved) {
        p.kill();
        reject(new Error('Operation timed out'));
      }
    }, 25000);
  });
}

// CLI runner
if (require.main === module) {
  const [,, op, paramsJson] = process.argv;
  if (!op) {
    console.error('Usage: node hostinger_helper.js <operation> [paramsJson]');
    process.exit(1);
  }
  const params = paramsJson ? JSON.parse(paramsJson) : {};
  runMcpOperation(op, params)
    .then(res => {
      console.log(JSON.stringify(res, null, 2));
      process.exit(0);
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { runMcpOperation };
