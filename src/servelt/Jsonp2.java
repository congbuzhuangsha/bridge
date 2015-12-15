package servelt;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONObject;

public class Jsonp2 extends HttpServlet {

	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		response.setContentType("text/plain;charset=utf-8");
		Map<String, Object> map=new HashMap<String, Object>();
		map.put("name","guoyansi");
		map.put("age", 25);
		JSONObject jsonObject=JSONObject.fromObject(map);
		PrintWriter out = response.getWriter();		
		out.print(jsonObject.toString());
		System.out.println(">>>>>>>>>>");
		out.flush();
		out.close();
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		doGet(request, response);		
	}

}
