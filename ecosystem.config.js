module.exports = {
  apps: [
    {
      name: 'backend',
      exec_mode: 'cluster',
      instances: '2', // Or a number of instances
      script: 'server.js',
      args: 'start'
    }
  ]
}
