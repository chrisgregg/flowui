var demo = {

    standard: function() {

        var loader = new flowui.Loader();

        setTimeout((function() { loader.close(); }), 5000);
    }

}


var init = function() {

    $(function() {
        prettyPrint();
    });

}

