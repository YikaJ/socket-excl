var request, cheerio, moment, xlsx;
//引入模块
fs = require("fs");
request = require("request");
cheerio = require("cheerio");

moment = require("moment");
require("twix");
xlsx = require("node-xlsx");

/*
* 将希望添加的股票代码加进去，用逗号分开即可
* */

var idList = [122662, 122695, 122605, 122583, 122714,124999,124482,122763, 122732, 122699, 122664, 122743, 122727, 122718, 122698, 122794, 122741, 122700, 122715, 122708, 122706, 122702, 122694, 122649, 122726, 122687, 122707, 124512, 122681, 122769, 122722, 122703, 122697, 122693, 122768, 122735, 122728, 122692, 122613, 122767, 122651, 122721, 122731, 124504, 122766, 124446, 122776, 122716, 122711, 122704, 122696, 122988, 122757, 122818, 122777, 122755, 122750, 122661, 122283, 122134, 122648, 122931, 122752, 122684, 122939, 122775, 122169, 122730, 122737, 122629, 122856, 122937, 122758, 122691, 122685, 122936, 122640, 124076, 122828, 122678, 122504, 122142, 122930, 122709, 122672, 122100, 122563, 122671, 122984, 122940, 122832, 122751, 122680, 122652, 122531, 122668, 122701, 122549, 122539, 124329, 122689, 122658, 122568, 122557, 122556, 122542, 122285, 122186, 122181, 122162, 122132, 122088, 122081, 122078, 124374, 122831, 122825, 122822, 122670, 122566, 122502, 122534, 124000, 122981, 122551, 122544, 122582, 122836, 124100, 122565, 124112, 122720, 122628, 112110, 122093];
var interval = 10;
//爬虫地址
var url = "http://money.finance.sina.com.cn/bond/quotes/sh";

//创建目录
var obj = [
    {
        "data": [
            ["债券代码","年化利息","税后利息", "付息次数", "C", "P0(全价）", "面值-P0", "T/Y", "AHPY", "到期日", "剩余天数"]
        ],
        "name": "债券"
    }
];
var errId = [];
var i = 0;
var count = 0;

var getStockTimer = setTimeout(reqUrl, 0);
function reqUrl(){
    var stockInfo = [];
    request(url + idList[i++] + ".html", function(err, res, body){
        var id = idList[i-1];
        if(!err && res.statusCode == 200){
            var $ = cheerio.load(body);
            var table = $(".blk12 table.tbl:nth-of-type(2)");

            /*数据源*/
            var annualRate = table.find("tr:nth-of-type(4) td:nth-of-type(2)").html()*0.01;
            var P0 = table.find("tr:nth-of-type(1) td:last-of-type").html();
            var deadLine = table.find("tr:last-of-type td:nth-of-type(4)").html();

            /*数据操作*/
            /*
             * 使用momentjs的插件twix,可以统计出两者的时间差
             */
            var range = moment().twix(deadLine);
            var leftDay = range.length("day");
            var countPayInterest = Math.ceil(leftDay/365);

            /*算法*/
            var AfterTaxInterest = annualRate*0.8;
            var C = (Math.pow(1+AfterTaxInterest, countPayInterest) - 1)*100;
            var AHPY = (C+(100 - P0))/(P0*(leftDay/365))*100;

            stockInfo.push(id);
            stockInfo.push(annualRate*100);
            stockInfo.push(annualRate.toFixed(3)*100*0.8);
            stockInfo.push(countPayInterest);
            stockInfo.push(C);
            stockInfo.push(P0);
            stockInfo.push(100-P0);
            stockInfo.push(leftDay/365);
            stockInfo.push(AHPY);
            stockInfo.push(deadLine);
            stockInfo.push(leftDay);

            obj[0].data.push(stockInfo);
            if(isNaN(AHPY)){
                errId.push(id);
                console.log(id + ",第" + i + "条数据有误！请手动获取数据");
            }else{
                console.log(id + ",第" + i + "条数据插入成功");
            }
            count += 1;

            if(count==idList.length) {
                clearInterval(getStockTimer);
                var file = xlsx.build(obj);
                fs.writeFileSync('到期债券数据统计.xlsx', file, 'binary');
                console.log("Excel生成成功！");
                if(errId.length){
                    console.log("其中有错误的列表为：");
                    errId.forEach(function(item){
                        console.log(item + ",数据有误");
                    });
                }
                console.log("一共插入了" + count + "条数据！");
            }else{
                setTimeout(reqUrl, 0);
            }
        }else{
            console.log(id + ",连接失败");
        }
    });
}





