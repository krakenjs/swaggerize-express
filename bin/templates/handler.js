'use strict';

module.exports = {
    <%_.forEach(methods, function (method) {%>
    <%=method.method%>: function <%=method.name%>(req, reply) {
    }
    <%})%>
};