/*
 *bridge桥梁的意思,bridge.js主要是为了架起前后端开发的桥梁.
 *bridge.js类库旨在解决以下问题,这也是bridge.js目的及意义所在.
 * 1.静态页面的发送post请求,会出现500错误,一个项目不可能全是get请求.
 * 2.前后台彻底分离后,静态资源的访问有两种
 * 		2.1相对路径:需要用../来寻找目标资源,开发难度大
 * 		2.2绝对路径.每次需要手动添加根目录名称,根目录只要有变化修改的难度就会很大.
 * 3.对于一些后台项目,会有超时管理.对于页面的零散的ajax请求怎么做到统一管理.
 * 	对超时时返回的数据及时作出响应,比跳转到登录页
 * 4.前后台并行开发,提高工作效率,和产品质量.
 * 5.前端开发不不依附于后端的开发工具,比如MyEclipse,Visual Studio.前端也有很多优秀的开发工具
 * 6.分工协作,前后端分离是必然的趋势,我们不能停留在几十年前的开发模式里,一人独揽全栈,
 * 	  环境变化这么快,不进步,就是退步.
 * 7.前端各种技术日益成熟,比如代码压缩,模块化开发.前后台不分离,再好的技术对我们来说只是名词.
 * 8.彻底分离时,会造成前端请求时出现跨域的尴尬境地,前端人员对于服务器环境的生疏,寸步难行.
 * 9.每个ajax请求都有可能出错,同样的报错代码,总不能在每个ajax代码里都写一遍或重新调用一遍
 * =========================================================================
 * bridge.js是在jQuery的基础上做的二次封装.
 * 1.ajax封装介绍(和jQuery的调用一样):
 * 	1.0.所有的请求被分为三种,因为请求方式不一样,路径格式也不一样.
 * 		跨域+远程==>彻底分离时,发出的请求.
 * 		只远程==>项目整合的时候,没有了跨域问题.
 * 		只本地==>请求前端的本地资源
 * 	1.1.一切post的请求都会被转换成远程请求.
 * 	1.2.get请求即可以访问本地资源,也可以发送远程请求
 * 	1.3.bridge.js不支持ajax的链式写法,因为ajax返回的是promise对象,
 * 		.done(),.fail()无法被被重写封装.(可惜!可惜!)
 *  1.4.若有参数cross:true,就发送远程(+跨域)请求,未定义参数cross或cross:false发送本地请求
 * 	1.4.
 * 		1.4.1.既可以远程也可以本地请求的方法.
 * 			bg.ajax(opt)
 * 			bg.load(url,param,callback).
 * 			bg.get(url,param,callback,type).
 * 			bg.getJSON(url,param,callback).
 * 		
 * 		1.4.2.因为无法添加参数cross:true,只能请求本地资源的方法
 * 			bg.getScript(url,callback).
 * 		
 * 		1.4.3.本地无法发送post请求,只能发送远程请求的方法
 * 			bg.post().
 *
 * bg.inti配置介绍:
 * 		root:"",//根目录,前后端的项目名称(根目录)最好相同,整合的时候比较容易
 *		view:"",//视图.前端的所有编码都放在一个目录下,这个目录就是视图
 *		cross:true,//跨域.开发时这里是true.整合后,改为false.有跨域+远程==>远程
 *  	hostName:"http://172.20.12.243:8080",//主机.跨域时的主机名称
 *		checkSession:false,//是否检测session失效的问题,有些网站不需要检测,但是大部分登录系统都要判断session
 *		noSession:function(data){//sessiong失效时执行的函数
 *		console.log("session失效,跳转页面");
 *		}
 *		
 *	后端配置:新建一个过滤器,
 *	设置:
 *	response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8020");
 *	或:
 *	response.setHeader("Access-Control-Allow-Origin", "*");
 *  前后端整合完毕后,屏蔽这个设置,就不存在跨域以及跨域带来的安全问题了.
 *  
 *  
 *  注意:这里是前后台整合后的项目.
 *  前后台项目名称是一样的.
 *  前后台彻底分离后,开发时视图层(这里的view文件夹)是在前端开发人员的电脑上的.
 * 
 */
(function($,undefined) {
	/**
	 * Bridge的实例对象,
	 */
	var objBridge=null;
	/**
	 * 根函数
	 */
	function Bridge() {
		objBridge=this;
		this.hostName={};
		this.root="";
		this.view="";
		this.cross=false;
	}

/**
 *session处理模块 
 */
	Bridge.prototype.session={
		checkSession:true,//是否检测session
		noSession:function(data){//session失效如何处理,data未服务端返回的数据
			
		},
	};
	/*Bridge.prototype.ajaxFail=function(XMLHttpRequest, textStatus, errorThrown){
		alert("服务器请求失败!");
	}*/
	/**
	 * 初始化Bridge的各个参数
	 * @param opt
	 */
	Bridge.prototype.init=function(opt){
		var k,value;
		for(var key in opt){
			 k=key.toLowerCase();//将键值转换成小写,防止误传参数,导致程序无法运行
			 value=opt[key];
			if(k==="nosession"){
				objBridge.session.noSession=value;
			}
			if(k==="checksession"){
				objBridge.session.checkSession=value;
			}
			if(k==="ajaxfail"){
				objBridge.ajaxFail=value;
			}
			if(k==="cross"){
				objBridge.cross=value;
			}
			if(k==="hostname"){
				objBridge.hostName=value;
			}
			if(k==="view"){
				objBridge.view=value;
			}
			if(k==="root"){
				objBridge.root=value;
			}
		}
	};
	function sessionFilter(data,xhr,jqXHR){
		var type=typeof data;
		var d=data;
		if(type=="object"){
			
		}else if(type==="string"){
			d=eval("("+d+")");
		}else{
			throw new Error("返回值的参数类型判断异常");
		}
		if(d.sessionStatus===-1){
			objBridge.session.noSession(d);
		}else{
			return data;
		}
	}
	/**
	 * 三种请求,
	 * 1.远程+跨域,==>bg.init.cross:true,ajaxOpt.cross:true
	 * 2.远程不跨域,==>bg.init.cross:false,ajaxOpt.cross:true
	 * 3.不跨域,不远程(本地)==>bg.init.cross不起作用,ajaxopt.cross:false或未定义
	 * 
	 */
	function getAjaxHttpType(optCross){
		if(typeof optCross==="undefined"||optCross==false){
			return 3;
		}
		else if(optCross==true){//设置了局部跨域参数
			if(objBridge.cross){//远程+跨域
				return 1;
			}else{//远程不跨域
				return 2;
			}
		}
	}
	
	function getAjaxUrl(type,url){
		var u="";
		if(type===1){//远程+跨域
			u=objBridge.hostName+"/"+objBridge.root+"/";
		}else if(type===2){//远程不跨域
			u="/"+objBridge.root+"/";
		}else if(type===3){//不跨域,不远程(本地)
			if(objBridge.view){
				u="/"+objBridge.root+"/"+objBridge.view+"/";
			}else{
				u="/"+objBridge.root+"/";
			}
		}
		return u+url;
	}
	
	/**
	 * 若要发送远程跨域请求,
	 * 需要添加参数data.cross=true;
	 * 否则被视为本地请求
	 * obj 请求对象
	 * url	请求路径
	 * data	请求参数
	 * callback 回调函数 可不填
	 */
	Bridge.prototype.load=function(obj,url,params,callback){
		if(!(obj instanceof $)){//如果obj不是jquery对象
			throw new Error("load的第一个参数obj不是jQuery对象.");
		}
		var type,httpType,url;
		type=typeof params;
		if (type==="function") {
            callback = params;
            params = undefined;
        }
		if(type==="object"){
			params.cross=true;
			httpType=getAjaxHttpType(params.cross);
			url=getAjaxUrl(httpType,url);
		}else if(type==="undefined"){//alert(1)
			url=getAjaxUrl(3,url);
		}
		 obj.load(url,params,callback);
	};
	/**
	 * post请求只能请求远程数据,
	 * 本地请求会报500错误.
	 */
	Bridge.prototype.post=function(url,params,callback,type){
		var t=typeof params;
		var httpType;
		if (t==="function") {
            type = type || callback;
            callback = params;
            params = undefined;
            t=typeof params;
        }
		url=getAjaxUrl(getAjaxHttpType(true),url);
		$.post(url,params,callback,type);
	}
	/*
	 * 若要发送远程跨域请求,
	 * 需要添加参数data.cross=true;
	 * 否则被视为本地请求
	 */
	Bridge.prototype.get=function(url,data,callback,type){
		var httpType,url;
		var t=typeof data;
		if (t==="function") {
            type = type || callback;
            callback = data;
            data = undefined;
            t=typeof data;
        }		
        if(t==="object"){
        	httpType=getAjaxHttpType(data.cross);        	
        }else if(t==="undefined"){
        	httpType=3;
        }else {
			throw new Error("get请求的参数判断异常");
		}
		url=getAjaxUrl(httpType,url);
		$.get(url,data,callback,type);
	}
	/*
	 * 若要发送远程跨域请求,
	 * 需要添加参数data.cross=true;
	 * 否则被视为本地请求
	 */
	Bridge.prototype.getJSON=function(url, data, callback){
		objBridge.get(url,data,callback,"json");
	}
	/*
	 * 因为无法添加参数,所以只能发送本地请求
	 */
	Bridge.prototype.getScript=function(url,callback){
		objBridge.get(url,undefined,callback,"script");
	}
	/**
	 * 1.跨域请求一定要添加参数cross:true,
	 * 2.本地请求可不写cross或cross:false
	 * opt,正常的$.ajax()参数但是跨域的话多一个cross:true
	 */
	Bridge.prototype.ajax=function(opt){
		var success;
		if(typeof opt==="string"){//讲参数转换成对象型参数
			opt={
				type:"get",
				url:opt
			}
		}
		//session过滤
		if(objBridge.session.checkSession){
			if(typeof opt.success=="undefined"){
				opt.success=sessionFilter;
			}
			else{
				success=opt.success;
				opt.success=function(data,xhr,jqXHR){
					if(sessionFilter(data,xhr,jqXHR)!=undefined){
						success(data,xhr,jqXHR);
					}
				}
			}
		}
		opt.url=getAjaxUrl(getAjaxHttpType(opt.cross),opt.url);
		$.ajax(opt);
	};

	
/**
* 当填写参数h后,解析你给的参数,如果为空自动从获取浏览器的地址
* 测试路径:>>>http://127.0.0.1:8020/url/index.html?id=1.2&gys=7777777777777777777777777&name=思思博士#api/126
* name是需要获取的值,
* h是指定href还是要自动获取.
*/
	Bridge.prototype.urlResolve=function(name,h){
		if(!name){
			console.error("urlResolve缺乏name参数");
			return "";
		}		
		var href=h?h:window.location.href;
		var condition;//条件
		if(name.indexOf(":")>-1){
			condition=name.split(":");
			name=condition[0];
			condition=condition[1];
		}
		
		var search=function(){
			return window.location.search
		}
		var searchNoP=function(){
			return search().substr(1);
		}
		var getPageNameAndExtName=function(){//获取页面名称和扩展名称
	        var arr=href.split("?")[0].split("/");
	        var len=arr.length;
	        return arr[len-1];
	    };
	       /**
	         * 填写了key获取指定的参数
	         * 没填写key参数获取所有的参数,以json格式返回
	         */
	     var getParam=function(key){//获取参数                    
	        var query=searchNoP();
	        if(!query){
	            return null;                            
	        }
	        var params={};
	        var paramArr=query.split("&");
	        var len=paramArr.length;
	        var params={};
	        var itemParam=[];
	        for(var i=0;i<len;i++){
	        	itemParam=paramArr[i].split("=");
	        	params[itemParam[0]]=itemParam[1];
	        }
	        if(key){
	        	return params[key]?params[key]:"";
	        }else{
	        	return params;
	        }                    
	    }
	     
		if(name==="href"){//获取路径
			return href;
		}else if(name==="search"){// 查询(参数)部分  带问号的
			return search();
		}else if(name==="searchNo?"){
			return searchNoP();
		}else if(name==="pathname"){//页面路径 url/index.html
			return window.location.pathname
		}else if(name==="port"){//URL 的端口部分     8080
			return window.location.port;
		}else if(name==="protocol"){//URL 的协议部分返回值 http:
			return window.location.protocol
		}else if(name==="host"){//url主机部分返回值   127.0.0.1:8020
			return window.location.host;
		}else if(name==="hash"){//锚点后面的值  #api/126
			return window.location.hash;
		}else if(name==="hashNo#"){//不带#号的锚点的值  api/126
			return window.location.hash.substr("1");
		}else if(name==="pageName"){//获取页面名称
	        return getPageNameAndExtName().split(".")[0];
		}else if(name==="extName"){//获取扩展名
	        return getPageNameAndExtName().split(".")[1];
		}else if(name==="param"){//获取参数
			return getParam(condition?condition:"");
		}else{
			console.error("urlResolve未匹配到你要获取的参数");
			return "";
		}           	
	};	
	window.bg=new Bridge();
})(jQuery);


bg.init({
	root:"bridge",//根目录
	view:"view",//视图
	cross:true,//跨域
	hostName:"http://192.168.1.206:8080",//主机
	checkSession:false,
	noSession:function(data){
		console.log("session失效,跳转页面");
	},
	requestFilter:[],//暂不实现
	responseFilter:[{//暂不实现
		condition:"status=1&flag=1",
		action:function(data){
			console.log("输出请求符合验证1,停止后续继续执行...");
		}
	},{
		condition:"status=2|flag=2",
		action:function(){
			console.log("输出请求符合验证2,停止后续继续执行...");
		}
	}]
});


/**
 * <button onclick="app()">测试hb</button>
 */

function app(){
	bg.ajax({
		type:"get",
		url:"Jsonp2",
		//url:"1.json",
		cross:true,
		//cross:false,
		data:{sessionFlag:"yes"},
		dataType:"text",
		success:function(data,textStatus,jqXHR){	
			console.log(data);
			//alert(data.name);
			$("#content").html(data);
		}
	});
	//$("#content").load("1.json",function(){});
	//bg.load($("#content"),"CROS",{});
	//bg.load($("#content"),"Jsonp2",{cross:true});
	/*bg.get("1.json",{},function(data){
		console.log(data);
	},"json");*/
	/*bg.get("Jsonp2",{session:"no",cross:true},function(data){
		console.log(data);
	},"json");*/
}






