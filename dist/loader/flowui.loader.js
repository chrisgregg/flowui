(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlowUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
                container.className = "flowui-loader flowui-loader-fixed";

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
        value: function _centerVertically() {}

        // We prob don't need this anymore we render loader as fixed, we can just use CSS
        /*
        let loaderElement = document.getElementById(this.id);
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const parentHeight = Math.max(this.parent.clientHeight, this.parent.innerHeight || 0);
        const loaderHeight = loaderElement.offsetHeight;
        const loaderWidth = loaderElement.offsetWidth;
        const scrollPosition = window.scrollY;
          // Center vertically in parent container
        let topLoaderDiv = (parentHeight / 2) - (loaderHeight / 2);
          // If parentHeight is >= viewportHeight, we need to use viewportHeight instead
        if (parentHeight > viewportHeight) {
            topLoaderDiv = (viewportHeight / 2) - (loaderHeight / 2);
              // If user is scrolled down at all, we need to adjust to make sure loader
            // is displayed within current viewport
            if (scrollPosition > 0) {
                topLoaderDiv += scrollPosition;
            }
        }
          loaderElement.style.top = topLoaderDiv + "px";
        loaderElement.style.left = 'calc(50% - ' + (loaderWidth/2)  + 'px)';
        */

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

},{"../../modal/js/index.js":2}],2:[function(require,module,exports){
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
        this._isPositionFixed = true;

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
            container.setAttribute("class", 'flowui-modal ' + (this.isPositionFixed ? 'flowui-modal-fixed' : '') + ' animated fadeIn ' + this.className);
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
    }, {
        key: 'isPositionFixed',
        get: function get() {
            return this._isPositionFixed;
        }

        // Allow other components to modify positioning of modal
        // this is necessary, as dialog's can be larger than viewport
        ,
        set: function set(value) {
            this._isPositionFixed = value;
            if (value === false) {
                var dialogContainer = document.getElementById(this.id);
                dialogContainer.className = dialogContainer.className.replace('flowui-modal-fixed', '');
            }
        }
    }]);

    return Modal;
}();

},{}]},{},[1])(1)
});

