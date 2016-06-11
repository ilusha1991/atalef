var read = require('node-readability');
var fs = require('fs');

var uri1 = 'http://www.ynet.co.il/articles/0,7340,L-4813928,00.html';
var uri2 = 'http://howtonode.org/really-simple-file-uploads';

read(uri1, function (err, article, meta) {


    fs.writeFile("readability-article.html", article.html);


    // Main Article
    // console.log(article.content);
    // Title
    // console.log(article.title);

    // HTML Source Code
    // console.log(article.html);
    // DOM
    // console.log(article.document);

    // Response Object from Request Lib
    // console.log(meta);

    // Close article to clean up jsdom and prevent leaks
    article.close();
});
