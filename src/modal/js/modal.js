'use strict';

module.exports = class Modal {

	/**
	 * Modal Constructor
	 * @param props
	 * @param.id : Modal Id
	 * @param.parent : Parent element to inject modal into
	 * @param.className : Class names to append to modal
     */
	constructor(props) {
		props = props || {};
		this.id = props.id || "modal-" + new Date().getTime();
		this.parent = props.parent ? (typeof props.parent === 'object' ? props.parent : document.querySelector(props.parent)) : document.body;
		this.className = props.className || "";
		this.close  = this._close;

		this._render();
		this._exportObjInstance();
	}


	/**
	 * Save reference to instantiated modal to window
	 * so can access to object through DOM
	 * @private
	 */
	_exportObjInstance() {
		window['FlowUI'] = window['FlowUI'] || {};
		window['FlowUI']._modals = window['FlowUI']._modals || {};
		window['FlowUI']._modals[this.id] = this;
	}


	/**
	 * Render Modal
	 * @private
	 */
	_render() {

		if (!document.getElementById(this.id)) {

			this.parent.className += ' flowui-modal-parent';

			const container = document.createElement("div");
			container.setAttribute("id", this.id);
			container.setAttribute("class", 'flowui-modal animated fadeIn ' + this.className);
			this.parent.appendChild(container);
		}
	}

	/**
	 * Close Modal
	 * @private
	 */
	_close() {

        let modalElement = document.getElementById(this.id);
        modalElement.className += " fadeOut";

        setTimeout(() => {
            modalElement.parentNode.removeChild(modalElement);
			this.parent.className = this.parent.className.replace('flowui-modal-parent', '');
        }, 1000);
	}

}

