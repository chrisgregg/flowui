'use strict';

module.exports = class Dialog {

    /**
     * Dialog Constructor
     * @param props {
     *  id: Unique ID for Dialog
     *  title: Dialog Title
     *  html: Html to inject
     *  url: URL to inject content from
     *  promise: Promise object to get content from
     *  className: CSS class to add to element
     *  parent: Element to inject modal (as query expression)
     *  escapable: True to allow user to close via escape button (default)
     *  animation: {
     *   in: "fadeIn" | "pulseIn" | "zoomIn"
     *   out: "fadeOut" | "pulseOut" | "zooOut"
     *  }
     *  events: {
     *   onopen: function,
     *   onclose: function
     *  }
     *  buttons: [
     *      { title: "Button Title", onclick: function }
     *  ]
     * }
     */
    constructor({id, title, html, url, parent, className, escapable = true, animation = {}, events = {}, buttons = [], promise }) {

        this.id = (id || new Date().getTime());
        this.dialogId = "dialog-" + this.id;	// ID for Dialog Element
        this.modalId = "modal-" + this.id;	// Generated ID for parent Modal
        this.title = title;
        this.html = html;
        this.url = url;
        this.promise = promise;
        this.parent = parent ? (typeof parent === 'object' ? parent : document.querySelector(parent)) : document.body;
        this.className = className;
        this.modalObj;
        this.loaderObj;
        this.buttons = buttons;
        this.escapable = escapable;

        this.animation = {
            in: animation.in || "fadeIn",
            out: animation.out || "fadeOut"
        };

        this.events = {
            onopen: events.onopen,
            onclose: events.onclose
        };

        this._renderDialog();
        this._attachEvents();
        this._exportObjInstance();

    }


    get close() {
        return this._close;
    }

    get centerVertically() {
        return this._centerVertically;
    }


    /**
     * Save reference to instantiated dialog's to window
     * so can access to object through DOM
     * @private
     */
    _exportObjInstance() {
        window.leanjs = window.leanjs || {};
        window.leanjs.dialogs = window.leanjs.dialogs || {};
        window.leanjs.dialogs[this.id] = this;
    }


    /**
     * Render Modal
     * @private
     */
     _renderModal() {

        this.modalObj = new window['FlowUI'].Modal({
            id: this.modalId
        });

        // If dialog content requires http request, show loader before rendering
        if (this.url || this.promise) {

            this.loaderObj = new window['FlowUI'].Loader({
                modalId: this.modalId
            });

        }

    }


    /**
     * Get Dialog Content (Async)
     * @private
     */
    _getContent() {

        // If promise provided during instantiation, use promise object instead to get content
        if (this.promise) {
            return this.promise;
        }

        let _this = this;

        return new Promise(function(resolve, reject) {

            // Static content provided as property
            if (_this.html) {
                resolve(_this.html);
            }

            // Content from a partial or template retreived via http
            else if (_this.url) {

                // Do the usual XHR stuff
                var req = new XMLHttpRequest();
                req.open('GET', _this.url);

                req.onload = function() {
                    if (req.status == 200) {
                        // Resolve the promise with the response text
                        resolve(req.response);
                    }
                    else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function() {
                    reject(Error("Network Error"));
                };

                req.send();

            }
        });

    }

    /**
     * Render Dialog
     * @private
     */
    _renderDialog() {

        this._renderModal();

        // Render Container
        let container = document.createElement("div");
        container.setAttribute('id', this.dialogId);
        container.setAttribute('class', 'flowui-dialog animated ' + (this.className ? this.className : ''));
        container.style.display = "none";

        // Render Content Wrapper
        let contentWrapper = document.createElement('div');
        contentWrapper.setAttribute('class', 'content');
        if (this.title) {
            let title = document.createElement('div');
            title.setAttribute('class', 'title');
            title.innerHTML = this.title;
            contentWrapper.appendChild(title);
        }

        // Render Inner Content
        let content = document.createElement('div');
        this._getContent().then((html) => {
            content.innerHTML = html;
            this._centerVertically();
        });
        content.setAttribute('class', 'inner-content');
        contentWrapper.appendChild(content);

        // Render Close Button
        let closeButtonElement = document.createElement('a');
        closeButtonElement.onclick = this._close.bind(this);
        closeButtonElement.className = "close";
        contentWrapper.appendChild(closeButtonElement);

        // Render Buttons
        if (this.buttons) {
            let buttonsWrapper = document.createElement('div');
            buttonsWrapper.setAttribute('class', 'buttons');
            let x = 0;
            this.buttons.forEach(function(button) {
                let buttonElement = document.createElement("a");
                buttonElement.setAttribute('class', 'flowui-button button' + x++ + ' ' + (button.className || ''));
                buttonElement.innerHTML = button.title;
                buttonElement.onclick = button.onclick;
                buttonsWrapper.appendChild(buttonElement);
            });
            contentWrapper.appendChild(buttonsWrapper);
        }

        container.appendChild(contentWrapper);

        // Add to modal
        let modalElement = document.getElementById(this.modalObj.id);
        modalElement.appendChild(container);

        // Once content loaded, display
        this._getContent().then(() => {

            // Hide Loader
            if (this.loaderObj) {
                this.loaderObj.close(false);
            }

            this._centerVertically();
            this._animateIn();
            this._focus();
        });


    }

    /**
     * Centre Dialog Vertically in Viewport
     * @private
     */
    _centerVertically() {

        let dialogElement = document.getElementById(this.dialogId);
        const modalHeight = document.getElementById(this.modalId).offsetHeight;
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const dialogHeight = dialogElement.offsetHeight;
        const scrollPosition = window.scrollY;
        const topDialogDiv = scrollPosition + (viewportHeight / 2) - (dialogHeight / 2);

        dialogElement.setAttribute('style','top:' + topDialogDiv + 'px');

    }


    /**
     * Handles Animating Dialog In
     * @private
     */
    _animateIn() {

        //document.getElementById(this.dialogId).className += " animated " + this.animation.in;
        if (this.events.onopen) {
            this.events.onopen();
        }

    }

    /**
     * Handle Closing Dialog and removing from DOM
     * @private
     */
    _close() {
        if (this.events.onclose) {
            this.events.onclose();
        }
        document.getElementById(this.dialogId).className += " animated " +  this.animation.out;
        this.modalObj.close();
        this._dispose();

    }


    /**
     * Remove instance from global window scope and check if another dialog
     * should be made active
     * @private
     */
    _dispose() {
        if (window.leanjs.dialogs[this.id]) {
            delete window.leanjs.dialogs[this.id];
        }
        this._reactivatePreviousDiaog();
    }

    /**
     * Reactives previous dialog (if any)
     * @private
     */
    _reactivatePreviousDiaog() {
        let allDialogs = window.leanjs.dialogs;
        let previousDialog = allDialogs[Object.keys(allDialogs)[Object.keys(allDialogs).length - 1]]
        if (previousDialog) {
            setTimeout(() => {
                previousDialog._focus();
            }, 500);
        }
    }

    /**
     * Set Dialog State (active, inactive)
     * @private
     */
    _setState(state) {

        document.getElementById(this.dialogId).setAttribute("state", state);

        // Strip out any animation classes
        let normalizeClasses = () => {
            let classes = document.getElementById(this.dialogId).className;
            let classArray  = classes.split(' ');
            classArray.splice(2, classArray.length);
            return classArray.join(' ');
        }

        let className = normalizeClasses();

        if (state == "active") {

            let animateInEffect = this.animation.in; // default
            if (Object.keys(window.leanjs.dialogs).length > 1) {
                animateInEffect =  "";
            }

            document.getElementById(this.dialogId).className = className + " " + animateInEffect;
        }
        else {

            let animateOutEffect = this.animation.out; // default
            if (Object.keys(window.leanjs.dialogs).length > 1) {
                animateOutEffect =  "inactiveOut";
            }

            document.getElementById(this.dialogId).className =  className + " " + animateOutEffect;

        }

    }


    /**
     * Sets active dialog, and inactivates others
     * @private
     */
    _focus() {

        let _this = this;
        this._setState("active");

        let allDialogs = window.leanjs ? window.leanjs.dialogs : {};
        for (var key in allDialogs) {
            var dialog = allDialogs[key];
            if (dialog.dialogId != _this.dialogId) {
                dialog._setState("inactive");
            }
        }
    }

    /**
     * Bind any necessary events
     * @private
     */
    _attachEvents() {

        // Allow user to hit escape to close window (unless overwritten by param)
        if (this.escapable) {
            window.addEventListener("keyup", (event) => {
                this._close();
            });
        }

    }

}

