(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlowUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

module.exports = function () {

    /**
     * Dialog Constructor
     * @param props {
     *  id: Unique ID for Dialog
     *  title: Dialog Title
     *  html: Html to inject
     *  url: URL to inject content from
     *  parent: Element to inject modal (as query expression)
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
    function Dialog(_ref) {
        var id = _ref.id;
        var title = _ref.title;
        var html = _ref.html;
        var url = _ref.url;
        var parent = _ref.parent;
        var _ref$animation = _ref.animation;
        var animation = _ref$animation === undefined ? {} : _ref$animation;
        var _ref$events = _ref.events;
        var events = _ref$events === undefined ? {} : _ref$events;
        var _ref$buttons = _ref.buttons;
        var buttons = _ref$buttons === undefined ? [] : _ref$buttons;
        var promise = _ref.promise;

        _classCallCheck(this, Dialog);

        this.id = id || new Date().getTime();
        this.dialogId = "dialog-" + this.id; // ID for Dialog Element
        this.modalId = "modal-" + this.id; // Generated ID for parent Modal
        this.title = title;
        this.html = html;
        this.url = url;
        this.promise = promise;
        this.parent = parent ? (typeof parent === "undefined" ? "undefined" : _typeof(parent)) === 'object' ? parent : document.querySelector(parent) : document.body;
        this.modalObj;
        this.loaderObj;
        this.buttons = buttons;

        this.animation = {
            in: animation.in || "fadeIn",
            out: animation.out || "fadeOut"
        };

        this.events = {
            onopen: events.onopen,
            onclose: events.onclose
        };

        this._renderDialog();

        this._exportObjInstance();
    }

    _createClass(Dialog, [{
        key: "_exportObjInstance",


        /**
         * Save reference to instantiated dialog's to window
         * so can access to object through DOM
         * @private
         */
        value: function _exportObjInstance() {
            window.leanjs = window.leanjs || {};
            window.leanjs.dialogs = window.leanjs.dialogs || {};
            window.leanjs.dialogs[this.id] = this;
        }

        /**
         * Render Modal
         * @private
         */

    }, {
        key: "_renderModal",
        value: function _renderModal() {
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

    }, {
        key: "_getContent",
        value: function _getContent() {

            // If promise provided during instantiation, use promise object instead to get content
            if (this.promise) {
                return this.promise;
            }

            var _this = this;

            return new Promise(function (resolve, reject) {

                // Static content provided as property
                if (_this.html) {
                    resolve(_this.html);
                }

                // Content from a partial or template retreived via http
                else if (_this.url) {

                        // Do the usual XHR stuff
                        var req = new XMLHttpRequest();
                        req.open('GET', _this.url);

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
        key: "_renderDialog",
        value: function _renderDialog() {
            var _this2 = this;

            this._renderModal();

            // Render Container
            var container = document.createElement("div");
            container.setAttribute('id', this.dialogId);
            container.setAttribute('class', 'flowui-dialog animated ');
            container.style.display = "none";

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
            this._getContent().then(function (html) {
                content.innerHTML = html;
                _this2._centerVertically();
            });
            content.setAttribute('class', 'inner-content');
            contentWrapper.appendChild(content);

            // Render Close Button
            var closeButtonElement = document.createElement('a');
            closeButtonElement.onclick = this._close.bind(this);
            closeButtonElement.className = "close";
            contentWrapper.appendChild(closeButtonElement);

            // Render Buttons
            if (this.buttons) {
                (function () {
                    var buttonsWrapper = document.createElement('div');
                    buttonsWrapper.setAttribute('class', 'buttons');
                    var x = 0;
                    _this2.buttons.forEach(function (button) {
                        var buttonElement = document.createElement("a");
                        buttonElement.setAttribute('class', 'flowui-button button' + x++ + ' ' + (button.className || ''));
                        buttonElement.innerHTML = button.title;
                        buttonElement.onclick = button.onclick;
                        buttonsWrapper.appendChild(buttonElement);
                    });
                    contentWrapper.appendChild(buttonsWrapper);
                })();
            }

            container.appendChild(contentWrapper);

            // Add to modal
            var modalElement = document.getElementById(this.modalObj.id);
            modalElement.appendChild(container);

            // Once content loaded, display
            this._getContent().then(function () {

                // Hide Loader
                if (_this2.loaderObj) {
                    _this2.loaderObj.close(false);
                }

                _this2._centerVertically();
                _this2._animateIn();
                _this2._focus();
            });
        }

        /**
         * Centre Dialog Vertically in Viewport
         * @private
         */

    }, {
        key: "_centerVertically",
        value: function _centerVertically() {

            var dialogElement = document.getElementById(this.dialogId);
            var modalHeight = document.getElementById(this.modalId).offsetHeight;
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var dialogHeight = dialogElement.offsetHeight;
            var scrollPosition = window.scrollY;
            var topDialogDiv = scrollPosition + viewportHeight / 2 - dialogHeight / 2;

            dialogElement.setAttribute('style', 'top:' + topDialogDiv + 'px');
        }

        /**
         * Handles Animating Dialog In
         * @private
         */

    }, {
        key: "_animateIn",
        value: function _animateIn() {

            //document.getElementById(this.dialogId).className += " animated " + this.animation.in;
            if (this.events.onopen) {
                this.events.onopen();
            }
        }

        /**
         * Handle Closing Dialog and removing from DOM
         * @private
         */

    }, {
        key: "_close",
        value: function _close() {
            if (this.events.onclose) {
                this.events.onclose();
            }
            document.getElementById(this.dialogId).className += " animated " + this.animation.out;
            this.modalObj.close();
            this._dispose();
        }

        /**
         * Remove instance from global window scope and check if another dialog
         * should be made active
         * @private
         */

    }, {
        key: "_dispose",
        value: function _dispose() {
            if (window.leanjs.dialogs[this.id]) {
                delete window.leanjs.dialogs[this.id];
            }
            this._reactivatePreviousDiaog();
        }

        /**
         * Reactives previous dialog (if any)
         * @private
         */

    }, {
        key: "_reactivatePreviousDiaog",
        value: function _reactivatePreviousDiaog() {
            var allDialogs = window.leanjs.dialogs;
            var previousDialog = allDialogs[Object.keys(allDialogs)[Object.keys(allDialogs).length - 1]];
            if (previousDialog) {
                setTimeout(function () {
                    previousDialog._focus();
                }, 500);
            }
        }

        /**
         * Set Dialog State (active, inactive)
         * @private
         */

    }, {
        key: "_setState",
        value: function _setState(state) {
            var _this3 = this;

            document.getElementById(this.dialogId).setAttribute("state", state);

            // Strip out any animation classes
            var normalizeClasses = function normalizeClasses() {
                var classes = document.getElementById(_this3.dialogId).className;
                var classArray = classes.split(' ');
                classArray.splice(2, classArray.length);
                return classArray.join(' ');
            };

            var className = normalizeClasses();

            if (state == "active") {

                var animateInEffect = this.animation.in; // default
                if (Object.keys(window.leanjs.dialogs).length > 1) {
                    animateInEffect = "";
                }

                document.getElementById(this.dialogId).className = className + " " + animateInEffect;
            } else {

                var animateOutEffect = this.animation.out; // default
                if (Object.keys(window.leanjs.dialogs).length > 1) {
                    animateOutEffect = "inactiveOut";
                }

                document.getElementById(this.dialogId).className = className + " " + animateOutEffect;
            }
        }

        /**
         * Sets active dialog, and inactivates others
         * @private
         */

    }, {
        key: "_focus",
        value: function _focus() {

            var _this = this;
            this._setState("active");

            var allDialogs = window.leanjs ? window.leanjs.dialogs : {};
            for (var key in allDialogs) {
                var dialog = allDialogs[key];
                if (dialog.dialogId != _this.dialogId) {
                    dialog._setState("inactive");
                }
            }
        }
    }, {
        key: "close",
        get: function get() {
            return this._close;
        }
    }, {
        key: "centerVertically",
        get: function get() {
            return this._centerVertically;
        }
    }]);

    return Dialog;
}();

},{}],2:[function(require,module,exports){
'use strict';

// Dependencies

var Modal = require('../../modal/js/modal.js');
var Loader = require('../../loader/js/loader.js');

// Core Module
var Dialog = require('./dialog.js');

// Export
module.exports = {
    Modal: Modal,
    Loader: Loader,
    Dialog: Dialog
};

},{"../../loader/js/loader.js":3,"../../modal/js/modal.js":4,"./dialog.js":1}],3:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
        var props = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, Loader);

        this.loaderId = props.id || "loader-" + new Date().getTime();
        this.modalId = props.modalId || "loader-modal-" + new Date().getTime(); // Generated ID for parent Modal
        this.parent = props.parent ? _typeof(props.parent) === 'object' ? props.parent : document.querySelector(props.parent) : document.body;
        this.modalObj;

        this._render();
    }

    _createClass(Loader, [{
        key: "_render",


        /**
         *
         * @private
         */
        value: function _render() {

            this._renderModal();

            if (!document.getElementById(this.loaderId)) {
                var _container = document.createElement("div");
                _container.id = this.loaderId;
                _container.className = "flowui-loader";

                var loaderElement = document.createElement("div");
                loaderElement.className = "spinner";
                _container.appendChild(loaderElement);
            }

            document.getElementById(this.modalObj.id).appendChild(container);

            this._centerVertically();
            this._animateIn();
        }

        /**
         * Render Modal
         * @private
         */

    }, {
        key: "_renderModal",
        value: function _renderModal() {
            this.modalObj = new window['FlowUI'].Modal({
                id: this.modalId,
                parent: this.parent
            });
        }

        /**
         * Centre Dialog Vertically in Viewport
         * @private
         */

    }, {
        key: "_centerVertically",
        value: function _centerVertically() {

            var loaderElement = document.getElementById(this.loaderId);
            var modalHeight = document.getElementById(this.modalObj.id).offsetHeight;
            var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
            var viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
            var loaderHeight = loaderElement.offsetHeight;
            var loaderWidth = loaderElement.offsetWidth;
            var scrollPosition = window.scrollY;
            var topLoaderDiv = scrollPosition + viewportHeight / 2 - loaderHeight / 2;

            console.log('loaderHeight', loaderHeight);
            console.log('loaderWidth', loaderWidth);

            loaderElement.style.top = topLoaderDiv + "px";
            loaderElement.style.left = 'calc(50% - ' + loaderWidth / 2 + 'px)';
        }

        /**
         * Handles Animating Dialog In
         * @private
         */

    }, {
        key: "_animateIn",
        value: function _animateIn() {
            var _this = this;

            setTimeout(function () {
                document.getElementById(_this.loaderId).className += " animated zoomInLoader";
                document.getElementById(_this.loaderId).style.display = "";
            }, 400);
        }

        /**
         * Handle Animating Out Dialog
         * @private
         */

    }, {
        key: "_animateOut",
        value: function _animateOut() {
            document.getElementById(this.loaderId).className += " zoomOutLoader";
        }

        /**
         * Handle Closing and removing from DOM
         * @private
         */

    }, {
        key: "_close",
        value: function _close() {
            var dispose = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

            this._animateOut();
            if (dispose) {
                this.modalObj.close();
                this._dispose();
            }
        }

        /**
         * Remove from DOM and remove object
         * @private
         */

    }, {
        key: "_dispose",
        value: function _dispose() {
            delete this;
        }
    }, {
        key: "close",
        get: function get() {
            return this._close;
        }
    }]);

    return Loader;
}();

},{}],4:[function(require,module,exports){
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

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
		this.close = this._close;
		this._render();
	}

	/**
  * Render Modal
  * @private
  */


	_createClass(Modal, [{
		key: '_render',
		value: function _render() {
			if (!document.getElementById(this.id)) {
				var container = document.createElement("div");
				container.setAttribute("id", this.id);
				container.setAttribute("class", 'flowui-modal animated fadeIn ' + this.className);
				this.parent.appendChild(container);
			}
		}

		/**
   * Close Modal
   * @private
   */

	}, {
		key: '_close',
		value: function _close() {

			var modalElement = document.getElementById(this.id);
			modalElement.className += " fadeOut";

			setTimeout(function () {
				modalElement.parentNode.removeChild(modalElement);
			}, 1000);
		}
	}]);

	return Modal;
}();

},{}]},{},[2])(2)
});

