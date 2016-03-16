/*
 *bridge桥梁的意思,bridge.js主要是为了架起前后端开发的桥梁.
 *bridge.js类库旨在解决以下问题,这也是bridge.js目的及意义所在.
 * 1.静态页面的发送post请求,会出现500错误,一个项目不可能全是get请求.
 * 2.前后台彻底分离后,静态资源的访问有两种
 *         2.1相对路径:需要用../来寻找目标资源,开发难度大
 *         2.2绝对路径.每次需要手动添加根目录名称,根目录只要有变化修改的难度就会很大.
 * 3.对于一些后台项目,会有超时管理.对于页面的零散的ajax请求怎么做到统一管理.
 *     对超时时返回的数据及时作出响应,比跳转到登录页
 * 4.前后台并行开发,提高工作效率,和产品质量.
 * 5.前端开发不不依附于后端的开发工具,比如MyEclipse,Visual Studio.前端也有很多优秀的开发工具
 * 6.分工协作,前后端分离是必然的趋势,我们不能停留在几十年前的开发模式里,一人独揽全栈,
 *       环境变化这么快,不进步,就是退步.
 * 7.前端各种技术日益成熟,比如代码压缩,模块化开发.前后台不分离,再好的技术对我们来说只是名词.
 * 8.彻底分离时,会造成前端请求时出现跨域的尴尬境地,前端人员对于服务器环境的生疏,寸步难行.
 * 9.每个ajax请求都有可能出错,同样的报错代码,总不能在每个ajax代码里都写一遍或重新调用一遍
 * =========================================================================
 * bridge.js是在jQuery的基础上做的二次封装.
 * 1.ajax封装介绍(和jQuery的调用一样):
 *     1.0.所有的请求被分为三种,因为请求方式不一样,路径格式也不一样.
 *         跨域+远程==>彻底分离时,发出的请求.
 *         只远程==>项目整合的时候,没有了跨域问题.
 *         只本地==>请求前端的本地资源
 *     1.1.一切post的请求都会被转换成远程请求.
 *     1.2.get请求即可以访问本地资源,也可以发送远程请求
 *     1.3.bridge.js不支持ajax的链式写法,因为ajax返回的是promise对象,
 *         .done(),.fail()无法被被重写封装.(可惜!可惜!)
 *  1.4.若有参数cross:true,就发送远程(+跨域)请求,未定义参数cross或cross:false发送本地请求
 *     1.4.
 *         1.4.1.既可以远程也可以本地请求的方法.
 *             bg.ajax(opt)
 *             bg.load(url,param,callback).
 *             bg.get(url,param,callback,type).
 *             bg.getJSON(url,param,callback).
 *         
 *         1.4.2.因为无法添加参数cross:true,只能请求本地资源的方法
 *             bg.getScript(url,callback).
 *         
 *         1.4.3.本地无法发送post请求,只能发送远程请求的方法
 *             bg.post().
 *  1.5.bg.getHttpUrl(cross,url) 返回请求路径,打印ajax请求的路劲
 * bg.inti配置介绍:
 *         root:"",//根目录,前后端的项目名称(根目录)最好相同,整合的时候比较容易
 *        view:"",//视图.前端的所有编码都放在一个目录下,这个目录就是视图
 *        cross:true,//跨域.开发时这里是true.整合后,改为false.有跨域+远程==>远程
 *      hostName:"http://172.20.12.243:8080",//主机.跨域时的主机名称
 *        checkSession:false,//是否检测session失效的问题,有些网站不需要检测,但是大部分登录系统都要判断session
 *        noSession:function(data){//sessiong失效时执行的函数
 *        console.log("session失效,跳转页面");
 *        }
 *        
 *    后端配置:新建一个过滤器,
 *    设置:
 *    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8020");
 *    或:
 *    response.setHeader("Access-Control-Allow-Origin", "*");
 *  前后端整合完毕后,屏蔽这个设置,就不存在跨域以及跨域带来的安全问题了.
 * 
 */
//////////////////////////////////////////////////////////////////




//////////////////////////////////////////////////////////////
(function($,undefined) {
    if($==null){
        throw new Error("bridge出错了:没有找到jQuery或Zepto库.");
    }
    /**
     * Bridge的实例对象,
     */
    var objBridge=null;
    var config={
    	/*
    	 * 返回true,进入ajax程序,否则终止后面的ajax
    	 * */
    	inAjax:function(){
    		return true;
    	},
    	servers:{}
    }
    /**
     * 根函数
     */
    function Bridge() {
        objBridge=this;
        this.getConfig=function(){
        	return config;
        }
    }

/**
 *session处理模块 
 */
    /*Bridge.prototype.session={
        checkSession:false,//是否检测session
        noSession:function(data){//session失效如何处理,data为服务端返回的数据
            
        },
    };*/
    /**
     * 初始化Bridge的各个参数
     * @param opt
     */
    Bridge.prototype.init=function(opt){
       $.extend(config, opt);
       var hostName=window.location.protocol+"//"+window.location.host;
       config.servers["local"]={hostName:hostName,cross:false,root:config.root};
    };
    
    
    /**
     * 对于传递过来的server参数进行统一格式
     * @param server 可能是字符串也可能是对象
     */
    function resolveParamServer(server){
    	var type=typeof server;
    	if(type=="object"){
    		
    	}else if(type=="string"&&server){
    		server=config.servers[server];
    	}else{
    		server=config.servers["local"];
    	}
    	return server;
    }
    
    
    
    /**
     * 三种请求,
     * 1.远程+跨域,==>bg.init.cross:true,ajaxOpt.cross:true
     * 2.远程不跨域,==>bg.init.cross:false,ajaxOpt.cross:true
     * 3.不跨域,不远程(本地)==>bg.init.cross不起作用,ajaxopt.cross:false或未定义
     * 
     */
    function getAjaxHttpType(server,clientCross){
    	server=resolveParamServer(server);
    	var serverCross=server.cross;
        if(typeof clientCross=="undefined"||clientCross==false){//本地请求
            return 3;
        }
        else if(clientCross==true){//设置了局部跨域参数
            if(serverCross==true){//远程+跨域
                return 1;
            }else{//远程不跨域
                return 2;
            }
        }
    }
    /**
     * 根据不同的请求,生成不同的路径
     * @param type 请求路径
     * @param url  当前路径
     */
    function getAjaxUrl(type,url,server){
    	server=resolveParamServer(server);
        var u="";
        if(type===1){//远程+跨域
            u=server.hostName+"/"+server.root+"/";
        }else if(type===2){//远程不跨域
        	if(server.root==""){//当项目名称root为空时的路径用主机名代替
        		u=server.hostName+"/";
        	}else{
        		u="/"+server.root+"/";
        	}
        }else if(type===3){//不跨域,不远程(本地)
            if(config.view){
                u="/"+config.root+"/"+config.view+"/";
            }else{
                u="/"+config.root+"/";
            }
        }
        return u+url;
    }
    /**
     * 获取请求路径  测试请求的路劲
     * @param  server {hostName:"http:127.0.0.1:8080",cross:true,root:"itemName"}
     * @param  param {url:}	usr/getData
     * @return http:127.0.0.1:8080/itemName/usr/getData
     */
    Bridge.prototype.getHttpUrl=function(server,url,cross){
    	var type=getAjaxHttpType(server,cross);
        return getAjaxUrl(type,url,server);
    }
    /**
     * 若要发送远程跨域请求,
     * 需要添加参数data.cross=true;
     * 否则被视为本地请求
     * obj 请求对象
     * url    请求路径
     * data    请求参数
     * callback 回调函数 可不填
     * jquery的load中params参数如果有值则表示发送post请求,否则是get请求
     */
    Bridge.prototype.load=function(obj,url,params,callback){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        if(!(obj instanceof $)){//如果obj不是jquery对象
            throw new Error("load的第一个参数obj不是jQuery对象.");
        }
        var type,httpType,url;
        type=typeof params;
        if (type==="function") {//get请求
            callback = params;
            params = undefined;
        }
        else if(type==="object"){//post请求
            params.cross=true;
            httpType=getAjaxHttpType(params.server,true);
            url=getAjaxUrl(httpType,url,params.server);
        }else if(type==="undefined"){//alert(1)
            url=getAjaxUrl(3,url,"");
        }
         obj.load(url,params,callback);
    };
    /**
     * post请求只能请求远程数据,
     * 本地请求会报500错误.
     */
    Bridge.prototype.post=function(url,params,callback,type){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        var t=typeof params;
        var httpType;
        if (t==="function") {
            type = type || callback;
            callback = params;
            params = {};
        }
        params.cross=true;
        url=getAjaxUrl(getAjaxHttpType(params.server,true),url,params.server);
        $.post(url,params,callback,type);
    }
    /*
     * 若要发送远程跨域请求,
     * 需要添加参数data.cross=true;
     * 否则被视为本地请求
     */
    Bridge.prototype.get=function(url,data,callback,type){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        var httpType,url;
        var t=typeof data;
        var server="";
        if (t==="function") {
            type = type || callback;
            callback = data;
            data = undefined;
            t=typeof data;
        }        
        if(t==="object"){
            httpType=getAjaxHttpType(data.server,data.cross);
            server=data.server;
        }else if(t==="undefined"){
            httpType=3;
        }else {
            throw new Error("get请求的参数判断异常");
        }
        url=getAjaxUrl(httpType,url,server);
        $.get(url,data,callback,type);
    }
    /*
     * 若要发送远程跨域请求,
     * 需要添加参数data.cross=true;
     * 否则被视为本地请求
     */
    Bridge.prototype.getJSON=function(url, data, callback){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        objBridge.get(url,data,callback,"json");
    }
    /*
     * 因为无法添加参数,所以只能发送本地请求
     */
    Bridge.prototype.getScript=function(url,callback){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        objBridge.get(url,undefined,callback,"script");
    }
    /**
     * 1.跨域请求一定要添加参数cross:true,
     * 2.本地请求可不写cross或cross:false
     * opt,正常的$.ajax()参数但是跨域的话多一个cross:true
     */
    Bridge.prototype.ajax=function(opt){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        var success;
        if(typeof opt==="string"){//将参数转换成对象型参数
            opt={
                type:"get",
                url:opt
            }
        }
        opt.url=getAjaxUrl(getAjaxHttpType(opt.server,opt.cross),opt.url,opt.server);
        $.ajax(opt);
    };
      
    /**
     * 替换所有指定的字符
     * str 字符串
     * origin 需要替换的字符
     * target 替换成这个字符
     */
    Bridge.prototype.replaceAll=function(str,origin,target){
        if(str.indexOf(origin)<0){
            return str;
        }else{
            return arguments.callee(str.replace(origin,target),origin,target);
        }
    }
    
    
    
    /**
     * 格式化时间
     * dateTime 时间(戳)
     * 返回 yyyy-mm-dd
     * 
     * 待完善
     * 1.去除时分秒
     * 
     * 
     * 
     * 
     */
    Bridge.prototype.formateDate=function(dateTime,splitf){
        /**
         * 2015-01-05苹果浏览器不支持,改成2015/01/05,
         * dateTime+""是为了防止时间戳没有indexOf方法,报错.
         */
        dateTime=objBridge.replaceAll(dateTime+"","-","/");
        dateTime=new Date(dateTime);
        var currYear =dateTime.getFullYear();
        var currM=dateTime.getMonth()+1;
        var currD=dateTime.getDate();
        if(currM<10){
            currM="0"+currM;
        }
        if(currD<10){
            currD="0"+currD;
        }
        if(!splitf||splitf==1){
            return currYear+"-"+currM+"-"+currD;
        }else if(splitf==2){
            return currYear+"年"+currM+"月"+currD+"日";
        }else if(splitf==3){
            return currYear+"/"+currM+"/"+currD;
        }
    }
    /**
     * 获取时间中的各个元素
     * dataTime  时间
     * element 元素
     * bg.getDateElement("2016-01-01","week");
     * 
     */
    
    Bridge.prototype.getDateElement=function(dateTime,element){
        var currM,currD,week;
        dateTime=new Date(dateTime);
        if(element=="yyyy"){
            return dateTime.getFullYear();
        }else if(element=="M"){
            return getM();
        }else if(element=="MM"){
            currM=getM();
            return currM<10?("0"+currM):currM;
        }else if(element=="d"){
            return getD();
        }else if(element=="dd"){
            currD=getD();
            return currD<10?("0"+currD):currD;
        }else if(element=="weekIndex"){
            return dateTime.getDay();
        }else if(element=="weekName"){
        	week=["周日","周一","周二","周三","周四","周五","周六"];
        	return week[dateTime.getDay()]
        }
        function getD(){
            return dateTime.getDate();
        }
        function getM(){
            return dateTime.getMonth()+1;
        }
    }
    /**
     * 查询数组中是否存在指定元素
     * arr 数组
     * element 指定元素
     */
  Bridge.prototype.inArray=function(arr,element){
      try{
          if(!(arr instanceof Array)){
              throw new Error("请传入数组");
          }
          for(var i in arr){
              if(arr[i]===element){
                  return true;
              }
          }
          return false;
          
      }catch(e){
          alert("inArray:>>"+e.message);
          console.error("inArray:>>"+e.message);
      }
      
  }
  
  /**
	 * 最终返回一个数组,是两个数组的相同部分
	 * 经过这个方法后,参数中的两个参数交集部分也会被删除
	 * @param arr1 数组1 
	 * @param arr2 数组2
	 */
	Bridge.prototype.sameArray=function(arr1,arr2){
		var len=arr1.length;
		var len1=arr2.length;
		var out=0;
		var same=[];
		if(arguments[2]){
			same=arguments[2];
		}
		for(var i=0;i<len;i++){
			for(var j=0;j<len1;j++){
				if(arr1[i]===arr2[j]){
					same.push(arr1[i]);
					arr1.splice(i,1);
					arr2.splice(j,1);
					out++;
					break;
				}
			}
			if(out>0){
				break;
			}
		}
		if(out>0){//找到了相同的元素
			return arguments.callee(arr1,arr2,same);
		}else if(out==0){
			 return same;
		}
	}
	
  
  /**
   * 驱动视图载入
   * originView 当前视图对象
   * url 目标视图路径
   */
   Bridge.prototype.view=function(objOriginView,url,callback){
   		var tagName=objOriginView.get(0).tagName.toLowerCase();
   		if(tagName!=="bg-view"){
   			return;
   		}
   		if(typeof callback=="function"){
   			objOriginView.load(url,callback);
   		}else{
   			objOriginView.load(url);
   		}
   }
   /*
    *自动视图载入根据bg-url来加载视图,没找到则不加载(404)
    * */
   Bridge.prototype.initView=function(callback){
   	$("bg-view").each(function(){
   		var obj=$(this);
   		var url=obj.attr("bg-url");
   		objBridge.view(obj,url,callback);
   	});
   }
    
    
/**
* 当填写参数h后,解析你给的参数,如果为空自动从获取浏览器的地址
* 测试路径:>>>http://127.0.0.1:8020/url/index.html?id=1.2&gys=7777777777777777777777777&name=思思博士#api/126
* name是需要获取的值,
* h是指定href还是要自动获取.
* 
* 
* bg.urlResolve("param")  获取所有参数
* bg.urlResolve("param:name")  获取参数name
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
            if(h){
                return "?"+href.split("?")[1];
            }else{
                return window.location.search;
            }
        }
        var searchNoP=function(){//不带问号的条件
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
        }else if(name==="searchNo?"){//不带问号的
            return searchNoP();
        }else if(name==="pathname"){//页面路径 url/index.html
            if(h){
                alert("带完善!");                
            }else{
                return window.location.pathname;
            }
        }else if(name==="port"){//URL 的端口部分     8080
            return window.location.port;
        }else if(name==="protocol"){//URL 的协议部分返回值 http:
            return window.location.protocol;
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
})((typeof jQuery!=="undefined")?jQuery:(typeof Zepto!=="undefined"?Zepto:null));



/*****************************************************************************
 * 调用
 * <button onclick="app()">测试hb</button>
 ******************************************************************************
 */

/*bg.init({
				root:"bridge",//前端项目名称
				view:"",//前端视图根目录
			    servers:{
			    	"s1":{hostName:"http://192.168.6.130:8080",root:"bridge",cross:true},
			    	"s2":{hostName:"http://192.168.6.130:8080",root:"bridge2",cross:true}
			    }
			});
			
			function app(){
				//打印配置信息
				console.log(bg.getConfig());
				bg.ajax({
					type:"get",
					url:"Jsonp2",
					dataType:"text",
					server:"s1",
					cross:true,
					success:function(data){
						console.log(data);
					}
				});
				bg.ajax({
					type:"get",
					url:"jsonp",
					dataType:"text",
					server:"s2",
					cross:true,
					success:function(data){
						console.log(data);
					}
				});
				bg.get("1.txt",function(data){
					console.log("get1结果:>>")
					console.log(data);
				},"text");
				bg.get("1.txt",{},function(data){
					console.log("get2结果:>>")
					console.log(data);
				},"text");
				//500错误
				bg.post("1.txt",function(data){
					console.log("post结果:>>")
					console.log(data);
				},"text");
				//500错误
				bg.load($("#msg"),"1.txt",function(data){
					console.log("load结果:>>")
					console.log(data);
				});
				
				//打印上面ajax请求的最终的请求路劲(用于测试,和调试)
				console.log(bg.getHttpUrl({hostName:"http://192.168.6.130:8080",cross:true,root:"bridge"},"Jsonp2",true));
				console.log(bg.getHttpUrl({hostName:"http://192.168.6.130:8080",cross:true,root:"bridge2"},"jsonp",true));
			}*/