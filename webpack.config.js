const path = require('path');

module.exports = {
    entry: './src/app.ts',
    
    //налаштовує source maps для полегшення дебагінгу TypeScript
    devtool: 'inline-source-map',
    
    module: {
        rules: [
            {
                //налаштування для обробки .ts файлів
                test: /\.ts$/,
                use: 'ts-loader',
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
            },
            {
                //налаштування для обробки .css файлів
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
    
    resolve: {
        //розширення які webpack автоматично розпізнає при імпорті модулів
        extensions: [
            ".js", ".jsx", ".ts", ".tsx", ".less", ".css", ".json", 
            ".mjs", ".wasm", ".d.ts", ".json"
        ],
    },
    
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, './dist'),
    },
    
    mode: 'development',
    
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 9000,
    },
};
