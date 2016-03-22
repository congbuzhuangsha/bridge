bg.init({
	root:"bridge",//前端项目名称
	view:"",//前端视图根目录
    servers:{
    	"s1":{hostName:"http://192.168.6.130:8080",root:"bridge",cross:true},
    	"s2":{hostName:"http://192.168.6.130:8080",root:"bridge2",cross:true}
    },
    inAjax:function(){
    	
    },
    endAjax:function(){
    	
    },
    script:{
    	""
    }
});