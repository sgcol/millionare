const CopyPlugin = require("copy-webpack-plugin");

module.exports={
    pages:{
        index:'src/main.js',
        admin:'src/admin/main.js',
        setting: 'src/setting/main.js',
        // sharepoint:{
        //     entry:'src/sharepoint/main.js',
        //     filename:'s',
        // }
    },
    productionSourceMap: false,
    configureWebpack :{
        plugins:[
            new CopyPlugin({
                patterns: [
                  { from: "src/sharepoint/s.html", to: "s" , toType:'file'},
                ],
            }),
        ]
    
    }
}