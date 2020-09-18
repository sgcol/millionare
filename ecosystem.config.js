module.exports = {
	apps : [{
	  name: 'Wingo',
	  script: 'millionare/index.js',
  
	  // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
	  args: '--port=9000 --mongo=127.0.0.1/mill --debugout',
	  instances: 1,
	  autorestart: true,
	  watch: false,
	  max_memory_restart: '2G',
	  env: {
			NODE_ENV: 'production'
	  }
	}],
  
  };