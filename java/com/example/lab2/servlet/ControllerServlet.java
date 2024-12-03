package com.example.lab2.servlet;

import com.example.lab2.data.ResultsBean;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;

import java.io.IOException;

@WebServlet(name = "ControllerServlet", urlPatterns = {""})
public class ControllerServlet extends HttpServlet {

    public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            if(request.getParameter("x") != null ||
                    request.getParameter("y") != null || request.getParameter("r") != null){
                request.getRequestDispatcher("/AreaCheckServlet").forward(request, response);
                //request.getRequestDispatcher("/AreaCheckServlet").include(request, response);
            }
            else {
                request.getRequestDispatcher("/index.jsp").forward(request, response);
            }
        }
        catch (ServletException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.setContentType("application/json");
            response.getWriter().println("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
    @Override
    protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        ResultsBean resultBean = (ResultsBean) session.getAttribute("resultsBean");
        resultBean.clearResults();
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json");
    }
}
