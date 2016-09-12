var demo = {

    multipleCounter: 0,

    standard: function() {

        var dialog = new FlowUI.Dialog({
            title: "test title",
            html: "Standard dialog with static content",
            buttons: [
                {title: 'Yes', onclick: function(){}},
                {title: 'No', onclick: function() {
                    dialog.close();
                }}
            ]
        });
    },

    animation: function() {

        var dialog = new FlowUI.Dialog({
            title: "test title",
            html: "This dialog uses Pulse In/Out animation",
            animation: {
                in: "pulseIn",
                out: "pulseOut"
            },
            buttons: [
                {title: 'Yes', onclick: function(){}},
                {title: 'No', onclick: function() {
                    dialog.close();
                }}
            ]

        });
    },

    deferred: function() {

        var promiseObj = new Promise(function(resolve, reject) {
            setTimeout(function() {
                resolve("This is content from a promise");
            }, 5000);
        });

        var dialog = new FlowUI.Dialog({
            title: "test title",
            promise: promiseObj,
            buttons: [
                {title: 'Yes', onclick: function(){}},
                {title: 'No', onclick: function() {
                    dialog.close();
                }}
            ]

        });
    },

    ajax: function() {

        var dialog = new FlowUI.Dialog({
            title: "test title",
            url: "demo/ajax-content.html",
            buttons: [
                {title: 'Yes', onclick: function(){}},
                {title: 'No', onclick: function() {
                    dialog.close();
                }}
            ]
        });
    },

    multiple: function(count) {

        count = count || 1;

        var dialog = new FlowUI.Dialog({
            title: "Dialog #" + count,
            html: "Clicking 'Open New Dialog' will open another dialog and set current dialog to Inactive. Current dialog will become active again once new FlowUI.Dialog is closed.",
            animation: {
                in: "pulseIn",
                out: "pulseOut"
            },
            buttons: [
                {title: 'Open New Dialog', onclick: function() {
                    demo.multiple(++count);
                }},
                {title: 'Close Current Dialog', onclick: function() {
                    dialog.close();
                }}
            ]
        });
    },



}


var init = function() {

    $(function() {
        prettyPrint();
    });

}

