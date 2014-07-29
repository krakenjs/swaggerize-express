'use strict';

function <%=id%>(options) {
    if (!options) {
        options = {};
    }
    <%_.forEach(Object.keys(properties), function (prop) {%>
    this.<%=prop%> = options.<%=prop%>;
    <%})%>
}

module.exports = <%=id%>;