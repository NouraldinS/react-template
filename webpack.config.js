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
				test: /\.(le|c)ss$/,
				use: [
					// { loader: 'style-loader' },
					{
						loader: 'css-loader',
						options: {
							// strictMath: true,
							// noIeCompat: true,
							modules: true,
							// importLoaders: 1,
							localIdentName: '[path][name]__[local]--[hash:base64:5]'
						}
					}
					// {
					// 	loader: 'less-loader',
					// 	options: {
					// 		// strictMath: true,
					// 		// noIeCompat: true,
					// 		modules: true,
					// 		// importLoaders: 1,
					// 		localIdentName: '[path][name]__[local]--[hash:base64:5]'
					// 	}
					// }
				]
			}
		]
	},
	watch: true
};

module.exports = config;
