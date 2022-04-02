export default class Popup {

    /**
     * Constructor
     * @param {string} content Content of the popup (HTML code is allowed)
     * @param {number} delay Time the popup is displayed before fade out (in ms)
     */
    constructor(content, delay = 5000) {
        this.content = content
        this.delay = delay
        // div selectors
        this.bodyOverlay
        this.popup
        this.close
        // run
        if(!window.epCountdownPopupAlreadyOpen) {
            this.create()
            this.show()
        }
        this.timeoutId
    }

    create() {
        window.epCountdownPopupAlreadyOpen = true
        // body overlay (aboslute + overflow hidden)
        const body = document.querySelector('body')
        body.style.position = 'relative'
        this.bodyOverlay = document.createElement('div')
        this.bodyOverlay.classList.add('body-overlay')
        body.appendChild(this.bodyOverlay)
        // popup box
        this.popup = document.createElement('div')
        this.popup.classList.add('popup')
        this.popup.innerHTML = this.content
        this.bodyOverlay.appendChild(this.popup)
        this.popup = document.querySelector('.popup')
        // close btn
        this.close = document.createElement('div')
        this.close.classList.add('popup-close-btn')
        this.close.innerHTML = `
            <div class="popup-close-line1"></div>
            <div class="popup-close-line2"></div>`
        this.popup.appendChild(this.close)
        // close hover animation
        this.close.addEventListener('mouseover', () => gsap.to(this.close, {rotation: 180}))
        this.close.addEventListener('mouseleave', () => gsap.to(this.close, {rotation: 0}))
    }

    show() {
        const remove = () => {
            this.popup.remove()
            this.bodyOverlay.style.display = 'none'
            delete window.epCountdownPopupAlreadyOpen
            clearTimeout(this.timeoutId)
        }
        this.close.addEventListener('click', () => {
            gsap.to(this.popup, 0.3, {y: 100, opacity: 0, onComplete: remove})
        })
        // reveal anim & hide after delay
        this.bodyOverlay.style.display = 'block'
        gsap.fromTo(this.popup, 0.3, {y: 100, opacity: 0}, {y: 0, opacity: 1})
        this.timeoutId = setTimeout(() => {
            gsap.to(this.popup, 0.3, {y: 100, opacity: 0, onComplete: remove})
        }, this.delay)
    }

}