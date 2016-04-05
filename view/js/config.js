bg.init({
	root:"bridge",//前端项目名称
	view:"view",//前端视图根目录
	startPlaceHolder:"<%",//占位符的开始标识
	endPlaceHolder:"%>",//占位符的结束标识
	/*script:{
		"pageA":["js/jquery-2.1.4.min.js"],
		"pageB":["js/jquery-2.1.4.min.js","test/2.js"]
	},*/
	script:function(){//写法二
		 	var scriptJquery="js/jquery-2.1.4.min.js";
			return{
				"pageA":[scriptJquery,"test/1.js"],//bridge.js 上bridgePageName="pageA"
				"pageB":[scriptJquery,"test/2.js"] //bridge.js 上bridgePageName="pageB"
			};
	},
	ajaxSetup:{//ajax的全局配置
		
	},
	/*
	 * 返回true,进入ajax程序,否则终止后面的ajax
	 * */
	ajaxStart:function(){//调用ajax时,在发起请求前执行,未形成xhr
		return true;
	},
	ajaxSend:function(xhr,opts){//ajax发送前,已形成xhr
		
	},
    ajaxSuccess:function(xhr,opts){//请求成功,
    	
    },
	ajaxError:function(xhr,opts,statusText){//请求失败
		
	},
	ajaxComplete:function(xhr,opts){//请求完成,无论成功和失败
		
	},
	ajaxStop:function(){//调用ajax后,无论ajax请求的成功还是失败都调用无论xhr有没有形成
		
	},
	servers:{
    	"s1":{hostName:"http://192.168.6.130:8080",root:"bridge",cross:true},
    	"s2":{hostName:"http://192.168.6.130:8080",root:"bridge2",cross:true}
    }
});
