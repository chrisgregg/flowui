
module.exports = class Helpers {

    /**
     * Scroll to
     * @param element
     * @param to
     * @param duration
     */

    static scrollTo(element, to, duration) {

        let _this = this;

        let start = element.scrollTop,
            change = to - start,
            increment = 20;

        let animateScroll = (elapsedTime) => {
            elapsedTime += increment;
            let position = _this.easeInOut(elapsedTime, start, change, duration);
            element.scrollTop = position;
            if (elapsedTime < duration) {
                setTimeout(() => {
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
    static easeInOut(currentTime, start, change, duration) {
        currentTime /= duration / 2;
        if (currentTime < 1) {
            return change / 2 * currentTime * currentTime + start;
        }
        currentTime -= 1;
        return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
    }


}

