package servelt;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import net.sf.json.JSONArray;

public class Jsonp extends HttpServlet {
	public void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		response.setContentType("text/plain");
		response.setCharacterEncoding("utf-8");
		String jsonp=request.getParameter("callback");
		String paraName=request.getParameter("data");
		System.out.println("paraName"+paraName);
		List<String> list=new ArrayList<String>();
		list.add("abc");
		list.add("dcc");
		list.add("fdfdf");
		JSONArray jsonArray=JSONArray.fromObject(list);
		String result=jsonArray.toString();
		PrintWriter out = response.getWriter();
		out.write(jsonp+"("+result+")");		
		
	}

	public void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {

		doGet(request, response);
	}

}
