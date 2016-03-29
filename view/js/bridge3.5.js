(function(){
	var config={
    	/*
    	 * 返回true,进入ajax程序,否则终止后面的ajax
    	 * */
    	inAjax:function(){
    		return true;
    	},
    	outAjax:function(){
    		
    	},
    	servers:{}
    }
	
	function Bridge(){
		this.getConfig=function(){
        	return config;
       };
	}	
	
	 /**
     * 初始化Bridge的各个参数
     * @param opt
     */
    Bridge.prototype.init=function(opt){
       //$.extend(config, opt);
       for(var k in opt){
       	config[k]=opt[k];
       }
       var hostName=window.location.protocol+"//"+window.location.host;
       config.servers["local"]={hostName:hostName,cross:false,root:config.root};
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
   /*Bridge.prototype.view=function(objOriginView,url,callback){
   		var tagName=objOriginView.get(0).tagName.toLowerCase();
   		if(tagName!=="bg-view"){
   			return;
   		}
   		if(typeof callback=="function"){
   			objOriginView.load(url,callback);
   		}else{
   			objOriginView.load(url);
   		}
   }*/
   /*
    *自动视图载入根据bg-url来加载视图,没找到则不加载(404)
    * */
  /* Bridge.prototype.initView=function(callback){
   	$("bg-view").each(function(){
   		var obj=$(this);
   		var url=obj.attr("bg-url");
   		objBridge.view(obj,url,callback);
   	});
   }*/
    
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
    Bridge.prototype.url=function(name,h){
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
        }else if(name==="pathname"){//页面路径 url/index.html,主机名/页面路径
            if(h){
                return "";//待完善
            }else{
                return window.location.pathname;
            }
        }else if(name==="port"){//URL 的端口部分     8080
        	if(h){
               return "";//待完善
            }else{
                 return window.location.port;
            }
        }else if(name==="protocol"){//URL 的协议部分返回值 http:
        	if(h){
                if(href.indexOf("http:")>0){
                	return "http:";
                }else if(href.indexOf("https:")>0){
                	return "https:";
                }else{
                	return "";
                }
            }else{
                return window.location.protocol;
            }
        }else if(name==="host"){//url主机部分返回值   127.0.0.1:8020
        	if(h){
               return "";//待完善
            }else{
               return window.location.host;
            }
        }else if(name==="hash"){//锚点后面的值  #api/126
            if(h){
                return href.substr(href.indexOf("#"));
            }else{
               return window.location.hash;
            }
        }else if(name==="hashNo#"){//不带#号的锚点的值  api/126
            if(h){
                return href.substr(href.indexOf("#")+1);
            }else{
               return window.location.hash.substr("1");
            }
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
    	//server=resolveParamServer(server);
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
    	//server=resolveParamServer(server);
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
    /*
     * ajax 用法和jquery类似
     * 
     * */
    Bridge.prototype.ajax=function(opts){
		var defaults={
			url:"",
			type:"get",
			data:null,
			async:true,
			cross:false,
			server:"",
			timeout:0,
			dataType:"text",
			contentType:"application/x-www-form-urlencoded",
			beforeSend:function(xhr){},
			dataFilter:function(data,type){
				//var text=xhr.responseText;
				if(type=="json"){
					return JSON.parse(data);
				}else if(type=="html"||type=="text"){
					return data;
				}else if(type=="script"){
					eval(data);
					return data;
				}
			},
			success:function(data,textStatus,xhr){},
			"error":function(xhr,textStatus){},
			complete:function(xhr,textStatus){}
		};
		for(var k in defaults){
			if(typeof opts[k]!="undefined"){
				defaults[k]=opts[k];
			}
		}
		opts=defaults;
		opts.server=resolveParamServer(opts.server);
		var httpType=getAjaxHttpType(opts.server,opts.cross);
		opts.url=getAjaxUrl(httpType,opts.url,opts.server);

		var xhr=new XMLHttpRequest();
		var readyState=xhr.readyState;
		var status=xhr.status;
		if(readyState==0){//正在初始化....
			var abort=opts.beforeSend(xhr);
			if(typeof abort=="boolean"&&!abort){
				xhr.abort();
			}
		}
		xhr.onreadystatechange=function(){
			/*if(readyState==1){//正在初始化请求...
				console.log("正在初始化请求...");
			}else if(readyState==2){//正在发送请求...
				console.log("正在发送请求...");
			}else if(readyState==3){//正在接受数据...
				console.log("正在接受数据...");
			}else if(readyState==4){//完成请求...
				console.log("完成请求...");
			}*/
			readyState=xhr.readyState;
			status=xhr.status;
			if(readyState==4){
				if(status>=200&&status<300||status==304){
					var data=opts.dataFilter(xhr.responseText,opts.dataType);
						opts.success(data, xhr.statusText, xhr);	
				}else{
					opts.error(xhr,xhr.statusText);
				}
				opts.complete(xhr,xhr.textStatus);
			}
		};
		xhr.open(opts.type,opts.url,opts.async);
		xhr.send(opts.data);
	};
	
	
	
	window.bg=new Bridge();
	return;
	  
    /*************************
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
	* 以下内容准备作废
* */
	
	
	/*
	 *从jquery基础上封装
	 * */
	(function($,bg){
		if($==null){
	        throw new Error("bridge出错了:没有找到jQuery或Zepto库.");
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
    bg.load=function(obj,url,params,callback){
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
            params = "undefined";
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
    bg.post=function(url,params,callback,type){
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
    bg.get=function(url,data,callback,type){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        var httpType,url;
        var t=typeof data;
        var server="";
        if (t==="function") {
            type = type || callback;
            callback = data;
            data = "undefined";
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
    bg.getJSON=function(url, data, callback){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        objBridge.get(url,data,callback,"json");
    }
    /*
     * 因为无法添加参数,所以只能发送本地请求
     */
    bg.getScript=function(url,callback){
    	if(!this.getConfig().inAjax()){
    		return;
    	}
        objBridge.get(url,"undefined",callback,"script");
    }
    /**
     * 1.跨域请求一定要添加参数cross:true,
     * 2.本地请求可不写cross或cross:false
     * opt,正常的$.ajax()参数但是跨域的话多一个cross:true
     */
    bg.ajax=function(opt){
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
		
		
	})(jQuery,bg);
})();

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