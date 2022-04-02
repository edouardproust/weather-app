import { config } from "../config.js";
import Popup from "../components/popup/Popup.js"
import Tooltip from "../components/tooltip/Tooltip.js"

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export default class WeatherApp {

    /**
     * Constructor
     * 
     * @param {object} options 
     * * {string} ipapiKey
     * * {string} openWeatherKey
     * * {string} defaultBgImg
     * * {string} tooltip Tooltip text (HTML code is allowed)
     */
    constructor (options) {
        // options
        this.ipapiKey = options.ipapiKey
        this.openWeatherKey = options.openWeatherKey
        this.defaultBgImg = options.defaultBgImg ?? 'bg-default.jpg',
        this.tooltip = options.tooltip ?? "Change city name"
        this.reloadOnError = options.reloadOnError ?? true
        // selectors
        this.app = document.querySelector('#weather-app')
        this.dataContainer = document.querySelector('.data-container')
        // vars
        this.appHtmlInit
        this.cityFromIpAddress
        this.cityFromSearch
        this.previousData
        this.previousSearch
        this.error
        // init
        this.init()
    }

    /**
     * Do some actions when the app is launched (only once)
     * 
     * @returns {void}
     */
    init() {
        // get app HTML content
        this.appHtmlInit = this.app.innerHTML
        /* show loading background 
         (later we want the loading animation to be displayed on top of 
         weather photos, that's why loading background is not included 
         within loadingAnimation() method) */
        this.bgImgUpdate(this.defaultBgImg, false, 'center', 'repeat', 'auto')
        // ready to launch the app loop
        this.runApp()
    }

    /**
     * Run the app as a loop. 
     * It's fired after init() OR when the user searches for a city.
     * If the user makes a search, the loop goes back to the beginning.
     * 
     * @returns {void}
     */
    async runApp() {
        this.loadingAnimation()
        const apiData = await this.getAPIsData()
        this.fillPageWithData(apiData)
        this.searchCity()
    }

    /**
     * Returns data from APIs
     * 
     * @returns {object} Wheather data
     */
    async getAPIsData() {
        let data
        if(!this.cityFromIpAddress) { // when app is launch only
            this.cityFromIpAddress = await fetch(`http://api.ipapi.com/check?access_key=${this.ipapiKey}&format=1`)
                .then(response => response.json())
                .then(json => {
                    if(json.success === false) {
                        this.apiError(json.error.info, json.error.code, 'Ipapi')
                    }
                    return json.city
                })
        }
        let city = this.cityFromSearch ?? this.cityFromIpAddress
        data = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${this.openWeatherKey}&units=metric`)
            .then(result => result.json())
            .then(json => { 
                if(json.cod !== 200) {
                    this.apiError(json.message, json.cod, 'OpenWheather')
                }
                return json
            })
        /* Fetch success: override previous saved data by the new one
           Failure: kill */
        if(data) {
            this.previousData = data
            this.previousSearch = this.cityFromSearch ?? this.cityFromIpAddress
            return data
        }
    }

    /**
     * Fill page with data sent back by APIs
     * 
     * @param {object} data JSON object
     * 
     * @returns {void}
     */
    fillPageWithData(apiData) {
        // refill section with HTML
        this.app.innerHTML = this.appHtmlInit
        let [iconHtml, bgImage] = this.getIconsAndPics(apiData.weather[0].main)
        // update section with content from API
        document.querySelector('.city-data').innerText = apiData.name
        document.querySelector('.temp-data').innerText = Math.round(apiData.main.temp)
        document.querySelector('.temp-unit').innerText = '°C'
        document.querySelector('.desc-data').innerText = capitalize(apiData.weather[0].description)
        document.querySelector('.icon-data').innerHTML = iconHtml
        this.bgImgUpdate(bgImage, true, 'bottom')
    }

    /**
     * Run several events when the user taps on the city name
     * 
     * @returns {void}
     */
     searchCity() {
        this.searchTooltip()
        const cityInput = document.querySelector('.city-data')
        const clickInside = () => {
            cityInput.innerText = ''
            cityInput.style.border = '2px dashed rgba(255, 255, 255, 0.5)'
            // event listeners
            cityInput.addEventListener('keydown', pressKey)
            window.addEventListener('click', clickOutside)
        }
        const clickOutside = (e) => {
            if(e.target !== cityInput) {
                cityInput.innerText = this.previousSearch
                cityInput.style.border = 'none'
            }
        }
        const pressKey = (e) => {
            if(e.target.innerText.length >= 20 && e.keyCode != 8) { // keyCode 8 = 'return' key
                e.preventDefault()
            }
            if (e.code === 'Enter'){
                e.preventDefault()
                cityInput.style.border = 'none'
                // remove event listeners
                cityInput.removeEventListener('click', clickInside)
                cityInput.removeEventListener('keydown', pressKey)
                window.removeEventListener('click', clickOutside)
                //reload app with new city name as parameter
                this.cityFromSearch = e.target.innerText
                this.runApp()
            }
        }
        cityInput.addEventListener('click', clickInside)
    }

    /**
     * Handle errors sent back by APIs
     * 
     * @param {string} errorMessage Error message sent back by API | 'API limit reached', 'City not found',...
     * @param {string|number} errorCode Error code sent back by API | ie. '404',...
     * @param {string} apiName API name | ie. 'OpenWheater', 'Ipapi',...
     * @param {bool} reloadApp Reload app (with null param as cityName)? Show an error message on false | Default: false
     *
     * @returns {void}
    */
        apiError(errorMessage, errorCode, apiName = '') {
        if(this.reloadOnError) {
            this.restorePreviousSearch()
        } else {
            this.bgImgUpdate(this.defaultBgImg, true, 'center', 'repeat', 'auto')
            this.app.classList.add('text-dark')
            this.app.innerHTML = `
                <div class="data-container">
                    <p class="error-message-heading">
                        <b>${capitalize(errorMessage)}</b>
                    </p>
                    <p>(${apiName ? apiName + ' API: error' : 'Error'} ${errorCode})</p>
                    <p style="margin-top:20px">
                        Try to <a href="${config.appPath}">reload the page</a> or <a href="/">go back to home.
                    </p>
                </div>` 
            // stop script
            throw new Error(`API error ${errorCode}: ${errorMessage}`);
        }    
    }

    restorePreviousSearch() {
        // restore previous search
        this.app.innerHTML = this.appHtmlInit
        this.fillPageWithData(this.previousData)
        // show error message as a popup
        new Popup('The city you entered was not found. The previous city has been restored.')
        this.searchCity()
        throw new Error ('Script stoped')
    }

    /**
     * Make correspondance between the data sent back by the weather API 
     * and the icon & background photo to display on page, and return them.
     * 
     * @param {*} weatherMain 
     * @link Weather condition codes from OpenWeather docs: https://openweathermap.org/weather-conditions
     * @returns {array} [iconHtml, photo] Array containing the html code for the WheatherIcon font & background photo file name
     *
     * @returns {void}
    */
    getIconsAndPics(weatherMain) {
        // get day or night
        const dayOrNight = 'day'
        // get icon slug
        let slug, photo
        switch(weatherMain) {
            case 'Thunderstorm': 
                slug = 'thunderstorm'
                photo = 'thunderstorm.jpg'
                break
            case 'Drizzle': 
                slug = 'showers'
                photo = 'showers.jpg'
                break
            case 'Rain': 
                slug = 'rain'
                photo = 'rain.jpg'
                break
            case 'Snow': 
                slug = 'snow'
                photo = 'snow.jpg'
                break
            case 'Clear': 
                slug = 'sunny'
                photo = 'clear.jpg'
                break
            case 'Clouds': 
                slug = 'cloudy'
                photo = 'cloudy.jpg'
                break
            default: // 'Athmosphere' category on OpenWeatherMap
                slug = 'fog'
                photo = 'fog.jpg'
        }
        // convert & return
        const iconHtml = `<i class="wi wi-${dayOrNight}-${slug}"></i>`
        return [iconHtml, photo]
    }

    /**
     * Update app's background image
     * 
     * @param {string} bgImage Image file name | ie. 'default.jpg'
     * @param {bool} fadeIn Play fade in animation? | Default false
     * @param {string} bgPosition Value for the CSS 'background-position' property | Default: 'center'
     * @param {string} bgRepeat Value for the CSS 'background-repeat' property | Default: 'no-repeat'
     * @param {string} bgSize Value for the CSS 'background-size' property | Default: 'cover'
     * 
     * @returns {void}   
    */
    bgImgUpdate(
        bgImage, 
        fadeIn = false, 
        bgPosition = 'center', 
        bgRepeat = 'no-repeat', 
        bgSize = 'cover'
    ) {
        const bgImgUrl = `${config.appPath}img/photos/${bgImage}`
        this.app.style.backgroundImage = `url("${bgImgUrl}")`
        this.app.style.backgroundPosition = bgPosition
        this.app.style.backgroundRepeat = bgRepeat
        this.app.style.backgroundSize = bgSize
        if(fadeIn) {
            gsap.fromTo(this.app, 0.5, {opacity: 0}, {opacity: 1})
        }
    }

    /**
     * Show an animation while waiting for the data to be return by APIs 
     * (during async/await process)
     * 
     * @returns {string} HTML content containing the animation 
     */
    loadingAnimation() {
        this.app.innerHTML = `
            <lottie-player 
                src="${config.appPath}img/loading.json"  
                background="transparent"  
                speed="1"  
                style="width: 300px; height: 300px;"  
                loop autoplay
            ></lottie-player>
            <div class="loading-text">Loading...</div>`
    }

    /**
     * Display tooltips
     */
    searchTooltip() {
        const cityDiv = document.querySelector('h1.city')
        const cityNameTooltip = new Tooltip({
            content: this.tooltip, 
            container: cityDiv,
            y: '70px',
            translateY: '-10px'
        })
        cityDiv.addEventListener('mouseover', (e) => {
            cityNameTooltip.show()
        })
        cityDiv.addEventListener('mouseleave', (e) => {
            cityNameTooltip.hide()
        })
    }

}