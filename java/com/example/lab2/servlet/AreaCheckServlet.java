package com.example.lab2.servlet;

import com.example.lab2.data.ResultsBean;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import com.example.lab2.exception.CustomException;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Objects;

//@WebServlet(name = "AreaCheckServlet", value = "/AreaCheckServlet")
public class AreaCheckServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try{
            long startTime = System.nanoTime();
            float[] result = ParameterValidator.validate(request); // {x, y, r}
            String answer = AddPointBean.addPoint(request, result, startTime).toJson();
            if(Objects.equals(request.getHeader("Accept"), "application/json")) { // click on image
                response.getWriter().println(answer);
            }
            else {
                PrintHtml.htmlPointViewer(response, result, System.nanoTime() - startTime);
                //request.getRequestDispatcher("/result.jsp").forward(request, response);
            }
        }
        catch (NumberFormatException e) {
            ErrorHandler.handleBadRequest(response, "Invalid number format : " + e.getMessage());
        }
        catch (CustomException e) {
            ErrorHandler.handleBadRequest(response, "Custom exception : " + e.getMessage());
        } catch (Exception e) {
            ErrorHandler.handleInternalError(response);
        }

    }
}
class AddPointBean {
    public static ResultsBean.Result addPoint(HttpServletRequest request, float[] result, long startTime) {
        HttpSession session = request.getSession();
        ResultsBean resultBean = (ResultsBean)session.getAttribute("resultsBean");
        ResultsBean.Result resultPoint = new ResultsBean.Result(
                request.getParameter("x"),
                request.getParameter("y"),
                request.getParameter("r"),
                HitChecker.checkResult(result[0], result[1], result[2]),
                System.currentTimeMillis(),
                (System.nanoTime() - startTime));
        if(resultBean == null) {
            resultBean = new ResultsBean();
            session.setAttribute("resultsBean", resultBean);
        }
        resultBean.addResult(resultPoint);
        System.out.println(resultBean);
        return resultPoint;
    }
}
class ErrorHandler {

    public static void handleBadRequest(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        response.setContentType("text/html; charset=UTF-8");
        response.setContentType("application/json");
        response.getWriter().println("{\"error\": \"" + message + "\"}");
    }

    public static void handleInternalError(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        response.setContentType("application/json");
        response.getWriter().println("{\"error\": \"Internal server error.\"}");
    }
}

class PrintHtml {

    public static void htmlPointViewer(HttpServletResponse response, float[] result, long nanoTime) throws IOException {
        response.setContentType("text/html; charset=UTF-8");
        PrintWriter out = response.getWriter();

        out.println("<html>");

        out.println("<head>");
        out.println("<style>");
        out.println("body {");
        out.println("    background: linear-gradient(39deg, rgb(198 41 218 / 70%), rgb(218 21 21 / 70%));");
        out.println("    background-size: cover;");
        out.println("    background-position: center center;");
        out.println("    background-attachment: fixed;");
        out.println("    color: white;");
        out.println("    font-family: 'Arial', sans-serif;");
        out.println("    display: flex;");
        out.println("    justify-content: center;");
        out.println("    align-items: center;");
        out.println("    height: 100vh;");
        out.println("    margin: 0;");
        out.println("    padding: 0;");
        out.println("}");
        out.println(".content {");
        out.println("    text-align: center;");
        out.println("    max-width: 80%;");
        out.println("    padding: 20px;");
        out.println("    background: rgba(0, 0, 0, 0.7);");
        out.println("    border-radius: 15px;");
        out.println("    box-shadow: 0 0 15px rgba(0, 255, 0, 0.8);");
        out.println("}");
        out.println("h1 {");
        out.println("    font-size: 3em;");
        out.println("    color: #39ff14;");
        out.println("    text-shadow: 0 0 10px #39ff14, 0 0 20px #39ff14, 0 0 30px #39ff14;");
        out.println("    margin-bottom: 20px;");
        out.println("}");
        out.println("p {");
        out.println("    font-size: 1.2em;");
        out.println("    color: #ff00ff;");
        out.println("    margin: 10px;");
        out.println("    text-shadow: 0 0 10px #ff00ff, 0 0 20px #ff00ff;");
        out.println("}");
        out.println("a {");
        out.println("    color: #00bfff;");
        out.println("    text-decoration: none;");
        out.println("    font-size: 1.1em;");
        out.println("    text-shadow: 0 0 10px #00bfff, 0 0 20px #00bfff;");
        out.println("}");
        out.println("a:hover {");
        out.println("    color: #ff6347;");
        out.println("    text-shadow: 0 0 10px #ff6347, 0 0 20px #ff6347;");
        out.println("}");
        out.println("footer {");
        out.println("    position: absolute;");
        out.println("    bottom: 10px;");
        out.println("    font-size: 1em;");
        out.println("    color: #ff4500;");
        out.println("    text-shadow: 0 0 10px #ff4500, 0 0 20px #ff4500;");
        out.println("}");
        out.println("footer a {");
        out.println("    color: #ff4500;");
        out.println("    text-decoration: underline;");
        out.println("}");
        out.println("</style>");
        out.println("</head>");

        out.println("<body>");
        out.println("<div class=\"content\">");
        out.println("<h1>Результаты проверки попадания в область</h1>");
        out.println("<p>Координаты точки: (" + result[0] + ", " + result[1] + ")</p>");
        out.println("<p>Радиус области: " + result[2] + "</p>");
        out.println("<p>Попадание в область: " + (HitChecker.checkResult(result[0], result[1], result[2]) ? "Да" : "Нет") + "</p>");
        out.println("<p>Текущее время: " + System.currentTimeMillis() + "</p>");
        out.println("<p>Время выполнения запроса: " + nanoTime + " нс</p>");
        out.println("<a href=\"index.jsp\">Назад</a>");
        out.println("</div>");

        out.println("</body>");
        out.println("</html>");
    }

}

class ParameterValidator {
    public static float[] validate(HttpServletRequest request) throws CustomException {
        String xString = request.getParameter("x");
        String yString = request.getParameter("y");
        String rString = request.getParameter("r");
        if(xString == null || yString == null || rString == null)
            throw new CustomException("Не хватает аргументов");
        float x = Float.parseFloat(xString);
        float y = Float.parseFloat(yString);
        float r = Float.parseFloat(rString);
        return new float[] {x, y, r};
    }
}

class HitChecker {
    public static boolean checkResult(float x, float y, float r) {
        if (x <= 0 && y <= 0 && x >= -r && y >= -r) return true;
        if (x >= 0 && y >= 0 && r - 2 * x >= y) return true;
        return x >= 0 && y <= 0 && r * r - (x * x + y * y) >= 0;
    }
}