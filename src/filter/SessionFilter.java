package filter;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

public class SessionFilter implements Filter{

	@Override
	public void destroy() {
		System.out.println("销毁SessionFilter.....");
		
	}

	@Override
	public void doFilter(ServletRequest req, ServletResponse res,
			FilterChain chain) throws IOException, ServletException {
		HttpServletRequest request=(HttpServletRequest) req;
		HttpServletResponse response=(HttpServletResponse)res;
		String flag=request.getParameter("sessionFlag");
		//response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:8020");或者
		response.setHeader("Access-Control-Allow-Origin", "*");
		if("no".equals(flag)){
			response.setContentType("text/plain;charset=utf-8");
			Map<String, Object> map=new HashMap<String, Object>();
			map.put("message","项目超时");
			map.put("sessionStatus", -1);
			JSONObject jsonObject=JSONObject.fromObject(map);
			PrintWriter out = response.getWriter();		
			out.print(jsonObject.toString());
			System.out.println(">>>>>>>>>>");
			out.flush();
			out.close();
		}else{
			chain.doFilter(req,res);
		}
		
		
	}

	@Override
	public void init(FilterConfig filterConfig) throws ServletException {
		System.out.println("initSessionFilter.....");
		
	}

}
