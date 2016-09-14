(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlowUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

// Dependencies

var Modal = require('../../modal/js/modal.js');

// Core Module
var Loader = require('./loader.js');

// Export
module.exports = {
    Loader: Loader,
    Modal: Modal
};

},{"../../modal/js/modal.js":3,"./loader.js":2}],2:[function(require,module,exports){
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

            // Check that element doesn't already exist
            if (!document.getElementById(this.loaderId)) {
                var container = document.createElement("div");
                container.id = this.loaderId;
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
        key: "_renderModal",
        value: function _renderModal() {
            this.modalObj = new window['FlowUI'].Modal({
                id: this.modalId,
                parent: this.parent
            });
        }

        /**
         * Centre Dialog Vertically in Parent Element
         * @private
         */

    }, {
        key: "_centerVertically",
        value: function _centerVertically() {

            var loaderElement = document.getElementById(this.loaderId);
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

},{}],3:[function(require,module,exports){
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
		this._exportObjInstance();
	}

	/**
  * Save reference to instantiated modal to window
  * so can access to object through DOM
  * @private
  */


	_createClass(Modal, [{
		key: '_exportObjInstance',
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

			if (!document.getElementById(this.id)) {

				this.parent.className += ' flowui-modal-parent';

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
			var _this = this;

			var modalElement = document.getElementById(this.id);
			modalElement.className += " fadeOut";

			setTimeout(function () {
				modalElement.parentNode.removeChild(modalElement);
				_this.parent.className = _this.parent.className.replace('flowui-modal-parent', '');
			}, 1000);
		}
	}]);

	return Modal;
}();

},{}]},{},[1])(1)
});

