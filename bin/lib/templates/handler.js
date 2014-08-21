'use strict';

//handlers for <%=path%>
module.exports = {
    <%_.forEach(methods, function (method, i) {%>
    <%=method.method%>: function <%=method.name%>(req, res) {
        //respond with <%=method.output%>
    }<%if (i < methods.length - 1) {%>, <%}%>
    <%})%>
};
