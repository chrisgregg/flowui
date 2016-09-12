'use strict';

module.exports = class Loader {

    /**
     *
     * @param props
     * props.text : text to display while loading
     * props.parent : parent element to inject loader into
     * props.promise : if provided, loader will close when promise resolved
     * props.id : id of loader
     */
    constructor(props = {}) {

        this.loaderId = props.id || "loader-" + new Date().getTime();
        this.modalId = props.modalId || "loader-modal-" + new Date().getTime(); // Generated ID for parent Modal
        this.parent = props.parent ? (typeof props.parent === 'object' ? props.parent : document.querySelector(props.parent)) : document.body;
        this.modalObj;

        this._render();

    }


    get close() {
        return this._close;
    }


    /**
     *
     * @private
     */
    _render() {

        this._renderModal();

        if (!document.getElementById(this.loaderId)) {
            let container = document.createElement("div");
            container.id = this.loaderId;
            container.className = "flowui-loader";

            let loaderElement = document.createElement("div");
            loaderElement.className = "spinner";
            container.appendChild(loaderElement);
        }


        document.getElementById(this.modalObj.id).appendChild(container);

        this._centerVertically();
        this._animateIn();

    }


    /**
     * Render Modal
     * @private
     */
    _renderModal() {
        this.modalObj = new window['FlowUI'].Modal({
            id: this.modalId,
            parent: this.parent
        });
    }

    /**
     * Centre Dialog Vertically in Viewport
     * @private
     */
    _centerVertically() {

        let loaderElement = document.getElementById(this.loaderId);
        const modalHeight = document.getElementById(this.modalObj.id).offsetHeight;
        const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
        const loaderHeight = loaderElement.offsetHeight;
        const loaderWidth = loaderElement.offsetWidth;
        const scrollPosition = window.scrollY;
        const topLoaderDiv = scrollPosition + (viewportHeight / 2) - (loaderHeight / 2);

        console.log('loaderHeight',loaderHeight)
        console.log('loaderWidth',loaderWidth)

        loaderElement.style.top = topLoaderDiv + "px";
        loaderElement.style.left = 'calc(50% - ' + (loaderWidth/2)  + 'px)';

    }


    /**
     * Handles Animating Dialog In
     * @private
     */
    _animateIn() {

        setTimeout(() => {
            document.getElementById(this.loaderId).className += " animated zoomInLoader";
            document.getElementById(this.loaderId).style.display = "";
        }, 400);

    }

    /**
     * Handle Animating Out Dialog
     * @private
     */
    _animateOut() {
        document.getElementById(this.loaderId).className += " zoomOutLoader";
    }


    /**
     * Handle Closing and removing from DOM
     * @private
     */
    _close(dispose = true) {
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
    _dispose() {
        delete this;
    }



}