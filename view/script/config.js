bg.init({
	root:"bridge",//前端项目名称
	view:"view",//前端视图根目录
    servers:{
    	"s1":{hostName:"http://192.168.6.130:8080",root:"bridge",cross:true},
    	"s2":{hostName:"http://192.168.6.130:8080",root:"bridge2",cross:true}
    },
    inAjax:function(){//开始进入ajax
    	
    },
    endAjax:function(){//退出ajax
    	
    },
    script:{
    	"tmlist":["2.js","3.js","4.js"]
    }
});