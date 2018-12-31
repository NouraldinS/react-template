const path = require('path');
const config = {
	entry: './src/app.js',
	mode: 'development',
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				exclude: /node_modules/,
				use: ['babel-loader']
			},
			{
				test: /\.less$/,
				use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, {
					loader: 'less-loader', options: {
						strictMath: true,
						noIeCompat: true
					}
				}]
			}
		]
	},
	watch: true
};

module.exports = config;
