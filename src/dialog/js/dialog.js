'use strict';

const Helpers = require('./helpers.js');

module.exports = class Dialog {

    /**
     * Dialog Constructor
     * @param props {
     *  id: Unique ID for Dialog
     *  title: Dialog Title
     *  html: Html to inject
     *  url: URL to inject content from
     *  promise: Promise object to get content from
     *  buttons ([{title: '', onclick: function}]): Array of buttons to render
     *  options (DialogOption): Customization options
     */

    constructor({id, title, html, url, promise, buttons, options = {}}) {

        // Arguments
        this.id = (id || "dialog-" + new Date().getTime());
        this.title = title;
        this.html = html;
        this.url = url;
        this.promise = promise;
        this.buttons = buttons;

        this.options = new DialogOptions(options);

        // Public Properties
        this.type = "dialog";
        this.modalObj;
        this.loaderObj;
        this.dialogElement = null;
        this.parent = document.body;


        this._renderDialog();
        this._attachEvents();
        this._registerEventListeners();
        this._exportObjInstance();

    }


    get close() {
        return this._close;
    }

    get dispose() {
        return this._dispose;
    }


    /**
     * Save reference to instantiated dialog's to window
     * so can access to object through DOM
     * @private
     */
    _exportObjInstance() {
        window['FlowUI'] = window['FlowUI'] || {};
        window['FlowUI']._dialogs = window['FlowUI']._dialogs || {};
        window['FlowUI']._dialogs[this.id] = this;

        // Attach a reference to parent modal
        this.modalObj.children[this.id] = this;

    }


    /**
     * Render Modal
     * @private
     */
     _renderModal() {

        // Check if modal already exists for parent
        if (window['FlowUI']._modals) {
            for (var key in window['FlowUI']._modals) {
                let m = window['FlowUI']._modals[key];
                if (m.parent == this.parent) {
                    this.modalObj = window['FlowUI']._modals[m.id];
                }
            }
        }

        // If it doesn't exist, create new instance
        if (!this.modalObj) {
            this.modalObj = new window['FlowUI'].Modal();
        }

        // If dialog content requires http request, show loader before rendering
        if (this.url || this.promise) {
            this.loaderObj = new window['FlowUI'].Loader({
                modalId: this.modalObj.id
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

        return new Promise((resolve, reject) => {

            // Static content provided as property
            if (this.html) {
                resolve(this.html);
            }

            // Content from a partial or template retreived via http
            else if (this.url) {

                // Do the usual XHR stuff
                var req = new XMLHttpRequest();
                req.open('GET', this.url);

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
        let contentPromise = this._getContent();

        // Render Container
        let container = document.createElement("div");
        container.setAttribute('id', this.id);
        container.setAttribute('class', 'flowui-dialog animated ' + (this.options.className ? this.options.className : ''));
        //container.style.display = "none";

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
        contentPromise.then((html) => {
            content.innerHTML = html;
        });
        content.setAttribute('class', 'inner-content');
        contentWrapper.appendChild(content);

        // Render Close Button
        let closeButtonElement = document.createElement('a');
        closeButtonElement.onclick = this._close.bind(this);
        closeButtonElement.className = "close";
        contentWrapper.appendChild(closeButtonElement);

        // Render Buttons
        if (this.buttons && this.buttons.length > 0) {
            let buttonsWrapper = document.createElement('div');
            buttonsWrapper.setAttribute('class', 'buttons');
            let x = 0;
            this.buttons.forEach(function(button) {
                let buttonElement = document.createElement("a");
                buttonElement.setAttribute('class', 'flowui-button ' + x++ + ' ' + (button.className || ''));
                buttonElement.innerHTML = button.title;
                buttonElement.onclick = button.onclick;
                buttonElement.href = button.href || 'javascript:;';
                buttonsWrapper.appendChild(buttonElement);
            });
            contentWrapper.appendChild(buttonsWrapper);
        }

        container.appendChild(contentWrapper);

        // Add to modal
        this.modalObj.element.appendChild(container);

        // Store dialog element to class property
        this.dialogElement = container;

        // Once content loaded, display
        contentPromise.then(() => {

            // Hide Loader
            if (this.loaderObj) {
                this.loaderObj.close(false);
            }

            this._bindScripts();
            this._positionDialog();
            this._focus();

        });


    }

    /**
     * Positions Dialog in center of viewport,
     * scrolling page to top of Dialog if needed
     * @private
     */
    _positionDialog() {

        let dialogElement = document.getElementById(this.id);
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const dialogHeight = dialogElement.offsetHeight;
        const dialogWidth = dialogElement.offsetWidth;
        const scrollPosition = window.scrollY;

        let y = scrollPosition + (viewportHeight / 2) - (dialogHeight / 2);
        y = y < 0 ? 30 : y;

        dialogElement.style.top = y + 'px';

        // If dialog heigh doesn't fit in viewport, scroll page to top of dialog
        if (dialogHeight > viewportHeight) {
            this._scrollToDialog();
        }

    }

    /**
     * Scroll Page to top of Dialog
     * @private
     */
    _scrollToDialog() {

        let yPosition = this.dialogElement.offsetTop - 30;
        yPosition = yPosition < 0 ?  0 : yPosition;
        Helpers.scrollTo(document.body, yPosition, 1000);

    }


    /**
     * Bind Scripts
     * Dialog content can contain scripts, which need to be added to dom in order to be made available
     * @private
     */
    _bindScripts() {

        const scripts = Array.from(this.dialogElement.getElementsByTagName('script'));
        let externalScripts = [];
        let embeddedScripts = [];

        // Separate external script from embedded
        scripts.forEach((script) => {
            if (script.src == "") {
                embeddedScripts.push(script);
            }
            else {
                externalScripts.push(script.src);
            }
        });

        // Helper function to load array of external scripts
        let loadScripts = function(scriptsArray, onComplete) {

            if (scriptsArray.length > 0) {
                let newScript = document.createElement('script');
                newScript.type = 'text/javascript';
                newScript.src = scriptsArray[0];
                document.documentElement.appendChild(newScript);

                newScript.addEventListener ("load", function() {
                    console.log('External script from content loaded:', scriptsArray[0]);
                    scriptsArray.shift();
                    loadScripts(scriptsArray, onComplete);

                }, false);
            }
            else {
                onComplete();
            }
        }

        // First, load external scripts
        loadScripts(externalScripts, function() {

            // Once all external scripts loaded, add embedded scripts
            embeddedScripts.forEach((script) => {
                let newScript = document.createElement('script');
                newScript.text = script.innerHTML;
                document.documentElement.appendChild(newScript);
                console.log('Embedded script from content added');
            });

        });




    }


    /**
     * Handle Closing Dialog and removing from DOM
     * @private
     */
    _close() {

        if (this.options.events.onclose) {
            this.options.events.onclose();
        }
        this._setState('closed');
        this._dispose();

        // Only close modal if there's no other dialogs using it
        const modalHasChildDialogs = () =>
        {
            var childDialogs = [];
            for (var key in this.modalObj.children) {
                var flowObject = this.modalObj.children[key];
                if (flowObject.type === 'dialog') {
                    childDialogs.push(flowObject);
                }
            }
            return childDialogs.length > 0;

        }

        if (!modalHasChildDialogs()) {
            this.modalObj.close();
        }



    }


    /**
     * Remove instance from global window scope and check if another dialog
     * should be made active
     * @private
     */
    _dispose() {

        // TO DO: Element from Remove from DOM
        setTimeout(()=> {
            try {
                this.dialogElement.parentNode.removeChild(this.dialogElement);
            }
            catch (ex) {
                // modal obj already removed
            }
        }, 1000);

        // Delete object reference from parent modal's children
        for (var key in this.modalObj.children) {
            var flowObj = this.modalObj.children[key];
            if (flowObj.id == this.id) {
                delete this.modalObj.children[this.id];
            }
        }

        delete window['FlowUI']._dialogs[this.id];

        this._reactivatePreviousDialog();
    }

    /**
     * Reactives previous dialog (if any)
     * @private
     */
    _reactivatePreviousDialog() {
        let allDialogs = window['FlowUI']._dialogs;
        let previousDialog = allDialogs[Object.keys(allDialogs)[Object.keys(allDialogs).length - 1]]
        if (previousDialog) {
            setTimeout(() => {
                previousDialog._focus();
            }, 500);
        }
    }


    /**
     * Handle Dialog State Change (focus, inactive, dismissed)
     * @param e
     * @returns {string}
     * @private
     */
    _onStateChange(e) {

        // Strip out any additional classes added after
        let sanitizeClasses = () => {
            const classes = "flowui-dialog animated " + this.options.className;
            return classes;
        }

        document.getElementById(this.id).setAttribute("state", e.detail.status);

        switch (e.detail.status) {
            case 'active':
                document.getElementById(this.id).className =  sanitizeClasses() + ' ' + this.options.animation.in;
                break;
            case 'inactive':
                // If dialog isn't stackable, instead of just inacivating - we ne to also dispose
                if (!this.options.stackable) {
                    document.getElementById(this.id).className =  sanitizeClasses() + ' inactive';
                    this._dispose();
                    break;
                }
                if (Object.keys(window['FlowUI']._dialogs).length > 1) {
                    document.getElementById(this.id).className =  sanitizeClasses() + ' inactive';
                    break;
                }
                document.getElementById(this.id).className = sanitizeClasses() + ' ' +  this.options.animation.out;
                break;
            case 'closed':
                document.getElementById(this.id).className = sanitizeClasses() + ' ' +  this.options.animation.out;
                break;
            default:
                // catch all
        }

    }

    /**
     * Set Dialog State (active, inactive)
     * @private
     */
    _setState(state) {

        var event = new CustomEvent("stateChange", { detail: { status: state } });
        this.dialogElement.dispatchEvent(event);

    }




    /**
     * Sets active dialog, and inactivates others
     * @private
     */
    _focus() {

        let _this = this;
        this._setState("active");

        let allDialogs = window['FlowUI'] ? window['FlowUI']._dialogs : {};
        for (var key in allDialogs) {
            var dialog = allDialogs[key];
            if (dialog.id != _this.id) {
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
        if (this.options.escapable) {
            window.addEventListener("keyup", (event) => {
                if (event.keyCode == 27) {
                    this._close();
                }
            }, false);
        }

    }


    /**
     * Register for any event listeners
     * @private
     */
    _registerEventListeners() {

        // Listen for dialog state change event
        this.dialogElement.addEventListener('stateChange', this._onStateChange.bind(this), false);

    }


}

/**
 * Options to customize Dialog
 */
class DialogOptions {

    constructor({className, stackable = false, escapable = true, animation = {}, events = {} }) {

            this.className = className || '';
            this.escapable = escapable;
            this.stackable = stackable;
            this.animation =  {
                in: animation.in || 'pulseIn',
                out: animation.out || 'pulseOut'
            },
            this.events = {
                onopen: events.onopen || null,
                onclose: events.onclose || null
            }
    }

}

