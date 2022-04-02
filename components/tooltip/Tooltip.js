export default class Tooltip {

    /**
     * Generate a tooltip
     * @param {Object} options 
     * @param {Event} options.event
     * @param {string} options.content
     * @param {HTMLElement} options.container
     * @param {number} options.delay Delay before hide, in seconds (0 on hover events, etc.)
     * @param {string} options.y Distance with units ( ie. '10px') 
     * @param {string} options.x Horizontal position: 'center', 'right' or 'left'
     * @param {string} options.translateY Distance with units ( ie. '10px') 
     * @param {string} options.backgroundColor Color code as a string (ie. '#000, 'black', 'rgb(0, 0, 0)')
     * @param {function} options.callbackBefore Callback to run just before the tooltip is shown
     * @param {function} options.callbackAfter Callback to run just after the tooltip is hidden
     * @param {number} options.callbackAfterTimeout Delay (in seconds) to wait after the tooltip has been hidden, before running the callbackAfter
     */
    constructor(options = {}) {
        this.o = Object.assign({}, {
            event: null,
            content: '', 
            container: document.querySelector('body'),
            delay: 0, 
            width: 'auto',
            y: 0,
            x: 'center',
            translateY: '0px',
            backgroundColor: '#222',
            callbackBefore: null,
            callbackAfter: null,
            callbackAfterTimeout: 0
        }, options)
        // selectors
        this.tooltip = document.createElement('div')
        // functions
        this.create()
        this.setStyle()
    }

    show() {
        let timeoutId1 = setTimeout(() => {
            if(this.o.callbackBefore) {
                this.o.callbackBefore()
            }
            this.tooltip.style.opacity = 1
            this.tooltip.style.transform = `translateY(${this.o.translateY})`
            if(this.o.delay > 0) {
                setTimeout(() => this.hide(), this.o.delay * 1000)
            }
            clearTimeout(timeoutId1)
        }, 10)
    }

    hide() {
        this.tooltip.style.opacity = 0
        this.tooltip.style.transform = `translateY(0)`
        if(this.o.callbackAfter) {
            if(this.ocallbackAfterTimeout === 0) {
                this.o.callbackAfter()
            } else {
                const cbaTimeoutId = setTimeout(() => {
                    this.o.callbackAfter()
                    clearTimeout(cbaTimeoutId)
                }, this.o.callbackAfterTimeout * 1000)
            }
        }
    }

    create() {
        this.tooltip.classList.add('tooltip')
        this.o.container.appendChild(this.tooltip)
        this.o.container.style.position = 'relative'
        this.o.container.appendChild(this.tooltip)
        this.tooltip.style.wdth = this.width
    }

    setStyle() {
        this.tooltip.innerHTML = this.o.content
        this.tooltip.style.bottom = this.o.y
        this.tooltip.style.backgroundColor = this.o.backgroundColor
        // x position
        switch(this.o.x) {
            case 'center': 
                let containerWidth = this.o.container.offsetWidth
                let tooltipWidth = this.tooltip.offsetWidth
                let position = (containerWidth / 2) - (tooltipWidth / 2)
                this.tooltip.style.left = position + 'px'
                break
            case 'left': this.tooltip.style.left = 0; break
            case 'right': this.tooltip.style.right = 0; break
        }
    }

}