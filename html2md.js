/**
 * @author: Jack Chen
 * */
var fs = require('fs');
var cheerio = require('cheerio');

var htmlDir = 'C:\\data\\blog\\html',
    mdDir = 'C:\\data\\blog\\md';

fs.readdir(htmlDir,function(err,files){
    if(err) {
        console.log(err);
    }
    console.log('开始读取: ', files);
    files.forEach(function(file){
        //console.log(mdDir+'\\'+file);
        html2md(htmlDir+'\\'+file);
    });
});

function html2md(htmlFilePath){
    fs.readFile(htmlFilePath,'utf-8',(err,data)=>{
        if(err) console.log('err: ', err);
        /**
         * title:博客标题
         * writeData：写入md中的文本
         * cnblogs_post_body:网络博客html中文章内容
         * children:子元素集合
         * len：children.length
         * code_idx:代码块索引
         * */
        var $ = cheerio.load(data),
            title = $('#cb_post_title_url').text(),
            writeData = '---\r\ntitle: '+title+'\r\n---\r\n',
            cnblogs_post_body = $('#cnblogs_post_body'),
            children = cnblogs_post_body.children(),
            len = children.length,
            code_idx = 0;
        /**
         * 根据md格式
         * 标题：---\r\ntitle\r\n---\r\n
         * 副标题： #(一到六个，我抓取的网络博客主要是h1到和h3)
         * 文本：不需要额外添加格式
         * 超链接：[text](url)
         * 图片：[Image](url)
         * 主要对p、img、a、div标签的文本进行格式化，后续可以自定义格式化标签文本
         * 代码块：```bash\r\n code \r\n ```\r\n
         * */
        for(var i=0;i<len;i++){
            var e = children[i],
                e_children = e.children[0],
                name = e.name;
            /**
             * 文章第三行开始显示more（不然会列出很多文本）
             * */
            if(i === 2){
                writeData = writeData +'\r\n'+'<!--more--> \r\n';
            }
            if('p' === name){
                if(e_children.type === 'text'){
                    if(e.children.length > 1){
                        for(var j=0,c_len=e.children.length;j<c_len;j++){
                            if(e.children[j]['name'] === 'a') writeData = writeData + '('+e.children[j].attribs.href + ')\r\n';
                            else if(e.children[j]['type'] === 'text') writeData = writeData + e.children[j].data + '\r\n';
                        }
                    }else writeData = writeData + e.children[0].data + '\r\n';
                }else if(e_children.name === 'img') writeData = writeData + '![Image]('+e.children[0].attribs.src + ')\r\n';
            }else if('div' === name){
                var codes = $('#cnblogs_post_body .cnblogs_code pre').eq(code_idx++).text();
                codes = codes.replace(/^(\s*)\d+/gm, ' ');
                writeData = writeData + '```bash\r\n' + codes + '\r\n```\r\n';
            }else if('h1' === name) writeData = writeData + '# ' + e_children.data + '\r\n';
            else if('h2' === name) writeData = writeData + '## ' + e_children.data + '\r\n';
            else if('h3' === name) writeData = writeData + '### ' + e_children.data + '\r\n';
        }
        fs.writeFile(mdDir+'\\'+title+'.md', writeData,(err) => {
            if(err) console.log(err);
        });
        console.log(title,' write done...');
    });
}
