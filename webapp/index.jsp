<%@ page import="com.example.lab2.data.ResultsBean" %>
<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<jsp:useBean id="resultsBean" class="com.example.lab2.data.ResultsBean" scope="session">
    <jsp:setProperty name="resultsBean" property="*"/>
</jsp:useBean>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Point in Area</title>
    <link href="./style.css" rel="stylesheet">
</head>
<body onload="document.body.className = 'loaded';">
<div id="notification-container"></div>
<div class="grid-container">
    <div class="header">
        <div id="header">
            ФИО Студента: Березовский Артемий Сергеевич<br>
            Номер группы: P3230<br>
            Номер варианта: 9942145
        </div>
    </div>
    <div class="results-container">
        <img src="image.jpg" id="image" alt="Описание картинки">
        <canvas id="canvas" width="600" height="600" style="position: absolute; top: 0; left: 0; pointer-events: none;"></canvas>
        <div>
            <h2>Результаты</h2>
            <div id="resultsTableContainer">
                <div id="resultsTable">
                    <div class="table-header">
                        <div class="table-cell">X</div>
                        <div class="table-cell">Y</div>
                        <div class="table-cell">R</div>
                        <div class="table-cell">Попадание в область</div>
                        <div class="table-cell">Текущее время</div>
                        <div class="table-cell">Время выполнения скрипта</div>
                    </div>
                    <div class="table-body">
                        <!-- Здесь добавяться данные -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="form-container">
        <form id="dataForm" action="/lab2/" method="GET">
            <label for="x">Координата X:</label>
            <select name="x" id="x">
                <option value="-4">-4</option>
                <option value="-3">-3</option>
                <option value="-2">-2</option>
                <option value="-1">-1</option>
                <option value="0">0</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
            </select>

            <label for="y">Координата Y:</label>
            <input type="number" id="y" name="y" step="any">

            <label for="r">Радиус:</label>
            <input type="number" id="r" name="r" step="any">

            <button type="submit">Отправить</button>
        </form>
    </div>
</div>
<script src="script.js"></script>
<script>
    <% if(resultsBean != null && resultsBean.getResults() != null) {
        for(ResultsBean.Result result : resultsBean.getResults()) { %>
            responseData(<%= result.toJson() %>);
            drawPointNewPage(
                parseFloat((<%= result.getX() %>).toString()),
                parseFloat((<%= result.getY() %>).toString()),
                parseFloat((<%= result.getR() %>).toString()),
                <%=result.getIsHit()%>);
    <%}}%>
</script>
</body>
</html>
