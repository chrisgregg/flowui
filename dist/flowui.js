(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlowUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {
    function Helpers() {
        _classCallCheck(this, Helpers);
    }

    _createClass(Helpers, null, [{
        key: "scrollTo",


        /**
         * Scroll to
         * @param element
         * @param to
         * @param duration
         */

        value: function scrollTo(element, to, duration) {

            var _this = this;

            var start = element.scrollTop,
                change = to - start,
                increment = 20;

            var animateScroll = function animateScroll(elapsedTime) {
                elapsedTime += increment;
                var position = _this.easeInOut(elapsedTime, start, change, duration);
                element.scrollTop = position;
                if (elapsedTime < duration) {
                    setTimeout(function () {
                        animateScroll(elapsedTime);
                    }, increment);
                }
            };

            animateScroll(0);
        }

        /**
         * Easing Function for Scrolling
         * @param currentTime
         * @param start
         * @param change
         * @param duration
         * @returns {*}
         */

    }, {
        key: "easeInOut",
        value: function easeInOut(currentTime, start, change, duration) {
            currentTime /= duration / 2;
            if (currentTime < 1) {
                return change / 2 * currentTime * currentTime + start;
            }
            currentTime -= 1;
            return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
        }
    }]);

    return Helpers;
}();

},{}],2:[function(require,module,exports){
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Helpers = require('./helpers.js');
var Modal = require('../../modal/js/index.js');
var Loader = require('../../loader/js/index.js');

module.exports = function () {

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

    function Dialog(_ref) {
        var id = _ref.id,
            title = _ref.title,
            html = _ref.html,
            url = _ref.url,
            promise = _ref.promise,
            buttons = _ref.buttons,
            _ref$options = _ref.options,
            options = _ref$options === undefined ? {} : _ref$options;

        _classCallCheck(this, Dialog);

        // Arguments
        this.id = id || "dialog-" + new Date().getTime();
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

        window['FlowUI'] = window['FlowUI'] || {};

        this._renderDialog();
        this._attachEvents();
        this._registerEventListeners();
        this._exportObjInstance();
    }

    _createClass(Dialog, [{
        key: '_exportObjInstance',


        /**
         * Save reference to instantiated dialog's to window
         * so can access to object through DOM
         * @private
         */
        value: function _exportObjInstance() {

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

    }, {
        key: '_renderModal',
        value: function _renderModal() {

            // Check if modal already exists for parent
            if (window['FlowUI']._modals) {
                for (var key in window['FlowUI']._modals) {
                    var m = window['FlowUI']._modals[key];
                    if (m.parent == this.parent) {
                        this.modalObj = window['FlowUI']._modals[m.id];
                    }
                }
            }

            // If it doesn't exist, create new instance
            if (!this.modalObj) {
                this.modalObj = new Modal();
            }

            // If dialog content requires http request, show loader before rendering
            if (this.url || this.promise) {
                this.loaderObj = Loader({
                    modalId: this.modalObj.id
                });
            }
        }

        /**
         * Get Dialog Content (Async)
         * @private
         */

    }, {
        key: '_getContent',
        value: function _getContent() {
            var _this2 = this;

            // If promise provided during instantiation, use promise object instead to get content
            if (this.promise) {
                return this.promise;
            }

            return new Promise(function (resolve, reject) {

                // Static content provided as property
                if (_this2.html) {
                    resolve(_this2.html);
                }

                // Content from a partial or template retreived via http
                else if (_this2.url) {

                        // Do the usual XHR stuff
                        var req = new XMLHttpRequest();
                        req.open('GET', _this2.url);

                        req.onload = function () {
                            if (req.status == 200) {
                                // Resolve the promise with the response text
                                resolve(req.response);
                            } else {
                                reject(Error(req.statusText));
                            }
                        };

                        req.onerror = function () {
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

    }, {
        key: '_renderDialog',
        value: function _renderDialog() {
            var _this3 = this;

            this._renderModal();
            var contentPromise = this._getContent();

            // Render Container
            var container = document.createElement("div");
            container.setAttribute('id', this.id);
            container.setAttribute('class', 'flowui-dialog animated ' + (this.options.className ? this.options.className : ''));
            //container.style.display = "none";

            // Render Content Wrapper
            var contentWrapper = document.createElement('div');
            contentWrapper.setAttribute('class', 'content');
            if (this.title) {
                var title = document.createElement('div');
                title.setAttribute('class', 'title');
                title.innerHTML = this.title;
                contentWrapper.appendChild(title);
            }

            // Render Inner Content
            var content = document.createElement('div');
            contentPromise.then(function (html) {
                content.innerHTML = html;
            });
            content.setAttribute('class', 'inner-content');
            contentWrapper.appendChild(content);

            // Render Close Button
            var closeButtonElement = document.createElement('a');
            closeButtonElement.onclick = this._close.bind(this);
            closeButtonElement.className = "close";
            contentWrapper.appendChild(closeButtonElement);

            // Render Buttons
            if (this.buttons && this.buttons.length > 0) {
                (function () {
                    var buttonsWrapper = document.createElement('div');
                    buttonsWrapper.setAttribute('class', 'buttons');
                    var x = 0;
                    _this3.buttons.forEach(function (button) {
                        var buttonElement = document.createElement("a");
                        buttonElement.setAttribute('class', 'flowui-button ' + x++ + ' ' + (button.className || ''));
                        buttonElement.innerHTML = button.title;
                        buttonElement.onclick = button.onclick;
                        buttonElement.href = button.href || 'javascript:;';
                        buttonsWrapper.appendChild(buttonElement);
                    });
                    contentWrapper.appendChild(buttonsWrapper);
                })();
            }

            container.appendChild(contentWrapper);

            // Add to modal
            this.modalObj.element.appendChild(container);

            // Store dialog element to class property
            this.dialogElement = container;

            // Once content loaded, display
            contentPromise.then(function () {

                // Hide Loader
                if (_this3.loaderObj) {
                    _this3.loaderObj.close(false);
                }

                _this3._bindScripts();
                _this3._positionDialog();
                _this3._focus();
            });
        }

        /**
         * Positions Dialog in center of viewport,
         * scrolling page to top of Dialog if needed
         * @private
         */

    }, {
        key: '_positionDialog',
        value: function _positionDialog() {

            var dialogElement = document.getElementById(this.id);
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var dialogHeight = dialogElement.offsetHeight;
            var dialogWidth = dialogElement.offsetWidth;
            var scrollPosition = window.scrollY;

            var y = scrollPosition + viewportHeight / 2 - dialogHeight / 2;
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

    }, {
        key: '_scrollToDialog',
        value: function _scrollToDialog() {

            var yPosition = this.dialogElement.offsetTop - 30;
            yPosition = yPosition < 0 ? 0 : yPosition;
            Helpers.scrollTo(document.body, yPosition, 1000);
        }

        /**
         * Bind Scripts
         * Dialog content can contain scripts, which need to be added to dom in order to be made available
         * @private
         */

    }, {
        key: '_bindScripts',
        value: function _bindScripts() {

            var scripts = Array.from(this.dialogElement.getElementsByTagName('script'));
            var externalScripts = [];
            var embeddedScripts = [];

            // Separate external script from embedded
            scripts.forEach(function (script) {
                if (script.src == "") {
                    embeddedScripts.push(script);
                } else {
                    externalScripts.push(script.src);
                }
            });

            // Helper function to load array of external scripts
            var loadScripts = function loadScripts(scriptsArray, onComplete) {

                if (scriptsArray.length > 0) {
                    var newScript = document.createElement('script');
                    newScript.type = 'text/javascript';
                    newScript.src = scriptsArray[0];
                    document.documentElement.appendChild(newScript);

                    newScript.addEventListener("load", function () {
                        console.log('External script from content loaded:', scriptsArray[0]);
                        scriptsArray.shift();
                        loadScripts(scriptsArray, onComplete);
                    }, false);
                } else {
                    onComplete();
                }
            };

            // First, load external scripts
            loadScripts(externalScripts, function () {

                // Once all external scripts loaded, add embedded scripts
                embeddedScripts.forEach(function (script) {
                    var newScript = document.createElement('script');
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

    }, {
        key: '_close',
        value: function _close() {
            var _this4 = this;

            if (this.options.events.onclose) {
                this.options.events.onclose();
            }
            this._setState('closed');
            this._dispose();

            // Only close modal if there's no other dialogs using it
            var modalHasChildDialogs = function modalHasChildDialogs() {
                var childDialogs = [];
                for (var key in _this4.modalObj.children) {
                    var flowObject = _this4.modalObj.children[key];
                    if (flowObject.type === 'dialog') {
                        childDialogs.push(flowObject);
                    }
                }
                return childDialogs.length > 0;
            };

            if (!modalHasChildDialogs()) {
                this.modalObj.close();
            }
        }

        /**
         * Remove instance from global window scope and check if another dialog
         * should be made active
         * @private
         */

    }, {
        key: '_dispose',
        value: function _dispose() {
            var _this5 = this;

            // TO DO: Element from Remove from DOM
            setTimeout(function () {
                try {
                    _this5.dialogElement.parentNode.removeChild(_this5.dialogElement);
                } catch (ex) {
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

    }, {
        key: '_reactivatePreviousDialog',
        value: function _reactivatePreviousDialog() {
            var allDialogs = window['FlowUI']._dialogs;
            var previousDialog = allDialogs[Object.keys(allDialogs)[Object.keys(allDialogs).length - 1]];
            if (previousDialog) {
                setTimeout(function () {
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

    }, {
        key: '_onStateChange',
        value: function _onStateChange(e) {
            var _this6 = this;

            // Strip out any additional classes added after
            var sanitizeClasses = function sanitizeClasses() {
                var classes = "flowui-dialog animated " + _this6.options.className;
                return classes;
            };

            document.getElementById(this.id).setAttribute("state", e.detail.status);

            switch (e.detail.status) {
                case 'active':
                    document.getElementById(this.id).className = sanitizeClasses() + ' ' + this.options.animation.in;
                    break;
                case 'inactive':
                    // If dialog isn't stackable, instead of just inacivating - we ne to also dispose
                    if (!this.options.stackable) {
                        document.getElementById(this.id).className = sanitizeClasses() + ' inactive';
                        this._dispose();
                        break;
                    }
                    if (Object.keys(window['FlowUI']._dialogs).length > 1) {
                        document.getElementById(this.id).className = sanitizeClasses() + ' inactive';
                        break;
                    }
                    document.getElementById(this.id).className = sanitizeClasses() + ' ' + this.options.animation.out;
                    break;
                case 'closed':
                    document.getElementById(this.id).className = sanitizeClasses() + ' ' + this.options.animation.out;
                    break;
                default:
                // catch all
            }
        }

        /**
         * Set Dialog State (active, inactive)
         * @private
         */

    }, {
        key: '_setState',
        value: function _setState(state) {

            var event = new CustomEvent("stateChange", { detail: { status: state } });
            this.dialogElement.dispatchEvent(event);
        }

        /**
         * Sets active dialog, and inactivates others
         * @private
         */

    }, {
        key: '_focus',
        value: function _focus() {

            var _this = this;
            this._setState("active");

            var allDialogs = window['FlowUI'] ? window['FlowUI']._dialogs : {};
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

    }, {
        key: '_attachEvents',
        value: function _attachEvents() {
            var _this7 = this;

            // Allow user to hit escape to close window (unless overwritten by param)
            if (this.options.escapable) {
                window.addEventListener("keyup", function (event) {
                    if (event.keyCode == 27) {
                        _this7._close();
                    }
                }, false);
            }
        }

        /**
         * Register for any event listeners
         * @private
         */

    }, {
        key: '_registerEventListeners',
        value: function _registerEventListeners() {

            // Listen for dialog state change event
            this.dialogElement.addEventListener('stateChange', this._onStateChange.bind(this), false);
        }
    }, {
        key: 'close',
        get: function get() {
            return this._close;
        }
    }, {
        key: 'dispose',
        get: function get() {
            return this._dispose;
        }
    }]);

    return Dialog;
}();

/**
 * Options to customize Dialog
 */

var DialogOptions = function DialogOptions(_ref2) {
    var className = _ref2.className,
        _ref2$stackable = _ref2.stackable,
        stackable = _ref2$stackable === undefined ? false : _ref2$stackable,
        _ref2$escapable = _ref2.escapable,
        escapable = _ref2$escapable === undefined ? true : _ref2$escapable,
        _ref2$animation = _ref2.animation,
        animation = _ref2$animation === undefined ? {} : _ref2$animation,
        _ref2$events = _ref2.events,
        events = _ref2$events === undefined ? {} : _ref2$events;

    _classCallCheck(this, DialogOptions);

    this.className = className || '';
    this.escapable = escapable;
    this.stackable = stackable;
    this.animation = {
        in: animation.in || 'pulseIn',
        out: animation.out || 'pulseOut'
    }, this.events = {
        onopen: events.onopen || null,
        onclose: events.onclose || null
    };
};

},{"../../loader/js/index.js":3,"../../modal/js/index.js":4,"./helpers.js":1}],3:[function(require,module,exports){
'use strict';

// Dependencies

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Modal = require('../../modal/js/index.js');

module.exports = function () {

    /**
     *
     * @param props
     * props.text : text to display while loading
     * props.parent : parent element to inject loader into
     * props.promise : if provided, loader will close when promise resolved
     * props.id : id of loader
     */
    function Loader() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        _classCallCheck(this, Loader);

        this.id = props.id || "loader-" + new Date().getTime();
        this.modalId = props.modalId || "loader-modal-" + new Date().getTime(); // Generated ID for parent Modal
        this.parent = props.parent ? _typeof(props.parent) === 'object' ? props.parent : document.querySelector(props.parent) : document.body;
        this.modalObj;

        this.type = "loader";

        window['FlowUI'] = window['FlowUI'] || {};

        this._render();
        this._exportObjInstance();
    }

    _createClass(Loader, [{
        key: '_exportObjInstance',


        /**
         * Save reference to instantiated modal to window
         * so can access to object through DOM
         * @private
         */
        value: function _exportObjInstance() {

            window['FlowUI'] = window['FlowUI'] || {};
            window['FlowUI']._loaders = window['FlowUI']._loaders || {};
            window['FlowUI']._loaders[this.id] = this;

            // Attach a reference to parent modal
            this.modalObj.children[this.id] = this;
        }

        /**
         *
         * @private
         */

    }, {
        key: '_render',
        value: function _render() {

            this._renderModal();

            // Check that element doesn't already exist
            if (!document.getElementById(this.id)) {
                var container = document.createElement("div");
                container.id = this.id;
                container.className = "flowui-loader";

                var loaderElement = document.createElement("div");
                loaderElement.className = "spinner";
                container.appendChild(loaderElement);

                document.getElementById(this.modalObj.id).appendChild(container);
            }

            this._centerVertically();
            this._animateIn();
        }

        /**
         * Render Modal
         * @private
         */

    }, {
        key: '_renderModal',
        value: function _renderModal() {
            this.modalObj = new Modal({
                id: this.modalId,
                parent: this.parent
            });
        }

        /**
         * Centre Dialog Vertically in Parent Element
         * @private
         */

    }, {
        key: '_centerVertically',
        value: function _centerVertically() {

            var loaderElement = document.getElementById(this.id);
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var parentHeight = Math.max(this.parent.clientHeight, this.parent.innerHeight || 0);
            var loaderHeight = loaderElement.offsetHeight;
            var loaderWidth = loaderElement.offsetWidth;
            var scrollPosition = window.scrollY;

            // Center vertically in parent container
            var topLoaderDiv = parentHeight / 2 - loaderHeight / 2;

            // If parentHeight is >= viewportHeight, we need to use viewportHeight instead
            if (parentHeight > viewportHeight) {
                topLoaderDiv = viewportHeight / 2 - loaderHeight / 2;

                // If user is scrolled down at all, we need to adjust to make sure loader
                // is displayed within current viewport
                if (scrollPosition > 0) {
                    topLoaderDiv += scrollPosition;
                }
            }

            loaderElement.style.top = topLoaderDiv + "px";
            loaderElement.style.left = 'calc(50% - ' + loaderWidth / 2 + 'px)';
        }

        /**
         * Handles Animating Dialog In
         * @private
         */

    }, {
        key: '_animateIn',
        value: function _animateIn() {
            var _this = this;

            setTimeout(function () {
                document.getElementById(_this.id).className += " animated zoomInLoader";
                document.getElementById(_this.id).style.display = "";
            }, 400);
        }

        /**
         * Handle Animating Out Dialog
         * @private
         */

    }, {
        key: '_animateOut',
        value: function _animateOut() {
            document.getElementById(this.id).className += " zoomOutLoader";
        }

        /**
         * Handle Closing and removing from DOM
         * @private
         */

    }, {
        key: '_close',
        value: function _close() {
            var dispose = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

            this._animateOut();
            if (dispose) {
                this.modalObj.close();
                this._dispose();
            }
        }

        /**
         * Remove object reference from dom
         * @private
         */

    }, {
        key: '_dispose',
        value: function _dispose() {

            delete window.FlowUI['_loaders'][this.id];
        }
    }, {
        key: 'close',
        get: function get() {
            return this._close;
        }
    }, {
        key: 'dispose',
        get: function get() {
            return this._dispose;
        }
    }]);

    return Loader;
}();

},{"../../modal/js/index.js":4}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {

    /**
     * Modal Constructor
     * @param props
     * @param.id : Modal Id
     * @param.parent : Parent element to inject modal into
     * @param.className : Class names to append to modal
     */
    function Modal(props) {
        _classCallCheck(this, Modal);

        props = props || {};

        this.id = props.id || "modal-" + new Date().getTime();
        this.parent = props.parent ? _typeof(props.parent) === 'object' ? props.parent : document.querySelector(props.parent) : document.body;
        this.className = props.className || "";
        this.children = {}; // associative array of child elements using this modal

        // Public Properties
        this.type = "modal";
        this.element = null;

        window['FlowUI'] = window['FlowUI'] || {};

        // Check if modal already exists, if so assign values from original
        // and don't re-render or export instance
        if (window['FlowUI']._modals && window['FlowUI']._modals[this.id]) {
            Object.assign(this, window['FlowUI']._modals[this.id]);
            return;
        }

        this._render();
        this._exportObjInstance();
    }

    _createClass(Modal, [{
        key: '_exportObjInstance',


        /**
         * Save reference to instantiated modal to window
         * so can access to object through DOM
         * @private
         */
        value: function _exportObjInstance() {
            window['FlowUI'] = window['FlowUI'] || {};
            window['FlowUI']._modals = window['FlowUI']._modals || {};
            window['FlowUI']._modals[this.id] = this;
        }

        /**
         * Render Modal
         * @private
         */

    }, {
        key: '_render',
        value: function _render() {

            this.parent.className += ' flowui-modal-parent';

            var container = document.createElement("div");
            container.setAttribute("id", this.id);
            container.setAttribute("class", 'flowui-modal animated fadeIn ' + this.className);
            this.parent.appendChild(container);

            this.element = container;
        }

        /**
         * Close Modal
         * @private
         */

    }, {
        key: '_close',
        value: function _close() {
            var _this = this;

            var modalElement = document.getElementById(this.id);
            modalElement.className += " fadeOut";

            setTimeout(function () {
                modalElement.parentNode.removeChild(modalElement);
                _this.parent.className = _this.parent.className.replace('flowui-modal-parent', '');
            }, 1000);

            this._dispose();
        }

        // Remove object references

    }, {
        key: '_dispose',
        value: function _dispose() {

            // Delete any child object references (UI elements using this modal obj)
            for (var key in this.children) {
                this.children[key].dispose();
            }
            delete window['FlowUI']._modals[this.id];
        }
    }, {
        key: 'close',
        get: function get() {
            return this._close;
        }
    }]);

    return Modal;
}();

},{}],5:[function(require,module,exports){
'use strict';

// Dependencies
var Modal = require('./modal/js/index.js');
var Loader = require('./loader/js/index.js');
var Dialog = require('./dialog/js/index.js');

// Export
module.exports = {
    Modal: Modal,
    Loader: Loader,
    Dialog: Dialog
};

},{"./dialog/js/index.js":2,"./loader/js/index.js":3,"./modal/js/index.js":4}]},{},[5])(5)
});

