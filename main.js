const { spawn } = require('child_process');
const path = require('path');

function start() {
  const scriptPath = path.join(__dirname, 'servers/index.js');
  const args = [scriptPath, ...process.argv.slice(2)];
  
  console.log([process.argv[0], ...args].join('\n'));
  
  const child = spawn(process.argv[0], args, {
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });

  child.on('message', (message) => {
    if (message === 'reset') {
      console.log('Restarting Bot...');
      child.kill();
      start();
    }
  });

  child.on('exit', (code) => {
    console.error('Exited with code:', code);
    if (code === '.' || code === 1 || code === 0) {
      start();
    }
  });
}

start();
