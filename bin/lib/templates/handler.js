'use strict';

/**
 * Operations on <%=path%>
 */
module.exports = {
    <%_.forEach(methods, function (method, i) {%>
    /**
     * <%=method.description%>
     * parameters: <%=method.parameters.map(function (p) { return p.name }).join(', ')%>
     * produces: <%=method.produces && method.produces.join(', ')%>
     */
    <%=method.method%>: function <%=method.name%>(req, res) {
        res.send(500);
    }<%if (i < methods.length - 1) {%>, <%}%>
    <%})%>
};
