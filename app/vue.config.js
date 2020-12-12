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
                  { from: "src/sharepoint/s.html", to: "s.html" , toType:'file'},
                  { from: "src/assets/logo.png", to:"img", toType:'dir'},
                  { from: "src/assets/box.png", to:"img", toType:'dir'},
                  { from: "src/assets/box-opened.png", to:"img", toType:'dir'},
                ],
            }),
        ]
    
    }
}