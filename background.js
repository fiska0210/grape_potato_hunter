// background.js

function remoteLog(level, message) {
  fetch('https://your-logging-server.com/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level: level, log: message, timestamp: Date.now() })
  }).catch(error => console.error('Remote logging failed:', error));
}

// 替換原生的 console.log
const originalLog = console.log;
console.log = function(...args) {
    originalLog.apply(console, args); // 依然在控制台印出 (如果開著)
    remoteLog('info', args.join(' ')); // 發送到遠端
};

// 之後您呼叫的 console.log("Some event") 就會發送到伺服器