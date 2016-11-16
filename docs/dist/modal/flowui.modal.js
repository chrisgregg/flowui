(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FlowUI = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Modal = require('./modal.js');

module.exports = {
    Modal: Modal
};

},{"./modal.js":2}],2:[function(require,module,exports){
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
		this.children = {}; // associative array of child elements using this modal

		// Public Properties
		this.type = "modal";
		this.element = null;

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

},{}]},{},[1])(1)
});

