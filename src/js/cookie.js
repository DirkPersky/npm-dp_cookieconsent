// Compilance Templates
import optIn from './html/compilance/opt-in.html';
// Content Templates
import selections from './html/content/selection.html';
import description from './html/content/descripton.html';
// Element Templates
import messagelink from './html/elements/messagelink.html';
import dpmessagelink from './html/elements/dpmessagelink.html';
import allowAll from './html/elements/allow-all.html';
// Layout Template
import dpextend from './html/layouts/dpextend.html';
// Other Templates
import revokebutton from './html/revoke.html';
import iframeoverlay from './html/overlay.html';
// erxternals
import merger from 'lodash.merge';
import defaultL10n from './l10n/en';
/*!
  * Cookie Consent Adapter
  * Copyright 2019 Dirk Persky (https://github.com/DirkPersky/npm-dp_cookieconsent/issues)
  * Licensed under AGPL v3+ (https://github.com/DirkPersky/npm-dp_cookieconsent/blob/master/LICENSE)
  */
window.addEventListener("load", function () {
    // handle Language Versions
    if (typeof dpCookieConsentLang == 'undefined') {
        window.DPCookieConsentL10N = defaultL10n;
    }
    window.DPCookieConsentL10N.prototype.replace = function () {
        window.cookieconsent_options.content = merger(this.lang, window.cookieconsent_options.content)
    };
    // init Language Versions
    (new window.DPCookieConsentL10N()).replace();

    // Init Consent Helper
    function CookieConsent() {
        this.cookie_name = 'dp_cookieconsent_status';
        this.cookie = {
            // This is the url path that the cookie 'name' belongs to. The cookie can only be read at this location
            path: '/',
            // This is the domain that the cookie 'name' belongs to. The cookie can only be read on this domain.
            //  - Guide to cookie domains - https://www.mxsasha.eu/blog/2014/03/04/definitive-guide-to-cookie-domains/
            domain: '',
            // The cookies expire date, specified in days (specify -1 for no expiry)
            expiryDays: 365,
            // If true the cookie will be created with the secure flag. Secure cookies will only be transmitted via HTTPS.
            secure: false
        };
        // revoke Reload flag
        this.prevCheckboxes = false;
        // checkboxes
        this.checkboxes = [
            {
                name: 'statistics',
                checked: false
            },
            {
                name: 'marketing',
                checked: false
            }
        ];
        // default Values
        this.settings = {
            autoOpen: true,
            revokable: true,
            dismissOnScroll: false,
            layout: 'dpextend',
            type: 'opt-in',
            theme: 'edgeless',
            position: 'bottom-right',
            reloadOnRevoke: false,
            overlay: {
                notice: true,
                box: {
                    background: 'rgba(0,0,0,.8)',
                    text: '#fff'
                },
                btn: {
                    background: '#F96332',
                    text: '#fff'
                }
            },
            palette: {
                popup: {
                    background: 'rgba(0,0,0,.8)',
                    text: '#FFFFFF'
                },
                button: {
                    background: '#F96332',
                    text: '#FFFFFF',
                }
            }

        };
    }

    /** Async Load Ressources **/
    CookieConsent.prototype.asyncLoad = function (u, t, c) {
        var d = document,
            o = d.createElement(t),
            s = d.getElementsByTagName(t)[0];

        switch (t) {
            case 'script':
                o.src = u;
                o.setAttribute('defer', '');
                break;
            case 'link':
                o.rel = 'stylesheet';
                o.type = 'text/css';
                o.setAttribute('defer', '');
                o.href = u;
                break;
        }
        if (c) {
            o.addEventListener('load', function (e) {
                c(null, e);
            }, false);
        }
        s.parentNode.insertBefore(o, s);
    };
    /** Async Load Helper for JS **/
    CookieConsent.prototype.asyncJS = function (u, c) {
        this.asyncLoad(u, 'script', c);
    };
    /** fallback: getElementsByTagName **/
    CookieConsent.prototype.getCookieElementsByTag = function (tag, selector) {
        if (typeof selector == 'undefined') selector = 'data-cookieconsent';
        // element holder
        var elements = [];
        // check browser function
        if (typeof document.querySelectorAll == 'undefined') {
            elements = document.querySelectorAll(tag + '[' + selector + ']');
        } else {
            // fallback
            var temp = document.getElementsByTagName(tag);
            for (var key in temp) {
                var element = temp[key];
                if (typeof element.getAttribute != 'undefined' && element.getAttribute(selector)) {
                    elements.push(element);
                }
            }
        }
        // return elements
        return elements;
    };
    /**
     * Load Iframes
     * @param element
     */
    CookieConsent.prototype.callIframeHandler = function (element) {
        /**
         * Create Element Copy
         * @type {ActiveX.IXMLDOMNode | Node}
         */
        var iframe = element.cloneNode(true);
        // replace src with data-src
        if (iframe.getAttribute('data-src')) {
            iframe.src = iframe.getAttribute('data-src');
        }
        // add Element to DOM
        element.parentNode.replaceChild(iframe, element);
        // add Loaded class
        iframe.classList.add("dp--loaded");
        // override attribute to only load once
        iframe.setAttribute('data-cookieconsent-loaded', iframe.getAttribute('data-cookieconsent'));
        iframe.removeAttribute('data-cookieconsent');
        /** call Inline Event **/
        window.DPCookieConsent.fireEvent('dp--cookie-iframe', iframe);
    };
    /**
     * Load Script codes
     * @param element
     */
    CookieConsent.prototype.callScriptHandler = function (element) {
        /** get HTML of Elements **/
        var code = element.innerHTML;
        /** trim Elements **/
        if (code && code.length) code = code.trim();
        /** run Code it something in in it **/
        if (code && code.length) {
            /** if Is Code Eval Code **/
            eval.call(this, code);
            /** call Inline Event **/
            window.DPCookieConsent.fireEvent('dp--cookie-fire', element);
        } else {
            /**
             * If is SRC load that
             * Dont use this src="", becouse some Browser will ignore the type=text/plain
             * prefer use data-src=""
             */
            if (element.getAttribute('data-src')) {
                this.asyncJS(element.getAttribute('data-src'), function (e) {
                    window.DPCookieConsent.fireEvent('dp--cookie-fire', element);
                });
            } else if (element.src) {
                this.asyncJS(element.src, function (e) {
                    window.DPCookieConsent.fireEvent('dp--cookie-fire', element);
                });
            }
        }
        // override attribute to only load once
        element.setAttribute('data-cookieconsent-loaded', element.getAttribute('data-cookieconsent'));
        element.removeAttribute('data-cookieconsent');
    };
    /** Callback after cookies are allowed **/
    CookieConsent.prototype.loadCookies = function () {
        /** Get all Scripts to load **/
        var elements = this.getCookieElementsByTag('script');
        // load Iframes
        elements = elements.concat(this.getCookieElementsByTag('iframe'));
        // elements exist?
        if (elements.length > 0) {
            var key;
            /** Loop through elements and run Code **/
            for (key = 0; key < elements.length; key++) {
                /** Chekbox Access check **/
                if (window.cookieconsent_options.layout === 'dpextend') {
                    var group = elements[key].getAttribute('data-cookieconsent');
                    if (group != 'required') {
                        // load cookies
                        this.loadCookiesPreset();
                        // check if value exist
                        if (!this.dpCookies.hasOwnProperty('dp--cookie-' + group) || this.dpCookies['dp--cookie-' + group] !== true) {
                            // abort script
                            continue;
                        }
                    }
                }
                /**
                 * check tag name
                 */
                if (typeof elements[key].tagName != 'undefined') {
                    /**
                     * Call Handler based on type
                     */
                    switch (elements[key].tagName.toUpperCase()) {
                        case 'IFRAME':
                            this.callIframeHandler(elements[key]);
                            break;
                        default:
                            this.callScriptHandler(elements[key]);
                    }
                }
            }
        }
        // set CurrentState of checkboxes
        window.DPCookieConsent.prevCheckboxes = [];
        window.DPCookieConsent.checkboxes.map(box => {
            if (box) {
                window.DPCookieConsent.prevCheckboxes.push({
                    name: box.name,
                    checked: box.checked
                });
            }
        });
    };
    /** Toogle Body Class **/
    CookieConsent.prototype.setClass = function (remove) {
        if (remove === true) {
            document.querySelector('body').classList.remove('dp--cookie-consent');
        } else {
            document.querySelector('body').classList.add('dp--cookie-consent');
        }
    };
    /** Load initial checkbox types from configuration **/
    CookieConsent.prototype.initCheckboxes = function () {
        var me = this;
        if (typeof window.cookieconsent_options.checkboxes === "object") {
            me.checkboxes = [];
            for (var key in window.cookieconsent_options.checkboxes) {
                me.checkboxes.push({
                    'name': key,
                    'checked': window.cookieconsent_options.checkboxes[key]
                });
            }
        }
        // render default layout
        var layout = DPCookieConsent.getCookieElementsByTag('script', 'data-dp-cookieSelect');
        if (layout.length > 0) {
            layout = layout[0].innerHTML;
        } else {
            layout = selections;
        }
        // set Default values
        me.checkboxes.map(function (checkbox) {
            let checked = '';
            if (checkbox.checked === true || checkbox.checked !== false && checkbox.checked.toLowerCase() === 'true') {
                checked = 'checked="checked"';
            }
            layout = layout.replace('{{checked.' + checkbox.name + '}}', checked);
        });
        // replace label
        layout = me.replaceLabels(layout);
        // assign to Content
        window.cookieconsent_options.content.cookieSelect = layout;
    };
    /** Replace Labels **/
    CookieConsent.prototype.replaceLabels = function (text) {
        for (var key in window.cookieconsent_options.content) {
            text = text.replace('{{' + key + '}}', window.cookieconsent_options.content[key]);
        }
        return text;
    };
    /** Checkbox Handling **/
    CookieConsent.prototype.setCheckboxes = function () {
        if (window.cookieconsent_options.layout != 'dpextend') return;
        var me = this;
        // load checkboxes
        var checkboxes = me.checkboxes.map(function (checkbox) {
            return me.loadCheckbox(checkbox.name);
        });
        // save Cookie Values
        this.saveCookie(checkboxes);
    };
    /** load checkboyes from cookie **/
    CookieConsent.prototype.loadCheckboxes = function () {
        if (window.cookieconsent_options.layout != 'dpextend') return;
        var me = this;
        // load cookies
        me.loadCookiesPreset();
        // load Checkboxes and set default values
        me.checkboxes.map(function (checkbox) {
            me.loadCheckbox(checkbox.name, true);
        });
    };
    /** Save checkbox values to Cookie **/
    CookieConsent.prototype.saveCookie = function (values) {
        var object = {};
        // build Store object
        values.map(function (e) {
            if (e) object[e.id] = e.checked;
        });
        // save value to local
        this.dpCookies = values;
        // save script selection
        window.cookieconsent.utils.setCookie(
            this.cookie_name,
            JSON.stringify(object),
            this.cookie.expiryDays,
            this.cookie.domain,
            this.cookie.path,
            this.cookie.secure
        );
    };
    /** Load Cookies **/
    CookieConsent.prototype.loadCookiesPreset = function () {
        if (this.dpCookies != false) this.dpCookies = window.cookieconsent.utils.getCookie(this.cookie_name);
        if (typeof this.dpCookies != 'undefined') {
            try {
                this.dpCookies = JSON.parse(this.dpCookies);
            } catch (error) {
                this.dpCookies = false;
            }
        } else {
            this.dpCookies = false;
        }
    };
    /** Load Checkboxes by name and fill Cookie value**/
    CookieConsent.prototype.loadCheckbox = function (fieldname, cookieLoad, override) {
        var me = this,
            id = 'dp--cookie-' + fieldname,
            checkbox = document.getElementById(id),
            checked = false,
            setValue = false;
        // load Cookie Value
        if (cookieLoad === true) {
            // get checkbox Value
            if (this.dpCookies && this.dpCookies.hasOwnProperty(id)) {
                checked = this.dpCookies[id];
                setValue = true;
            }
        } else if (typeof override != "undefined") {
            checked = override;
            setValue = true;
        }

        // if not exist abort
        if (!checkbox) {
            // write value back to element
            me.checkboxes.map((field, index) => {
                // write to storage
                if (setValue && field.name == fieldname) {
                    me.checkboxes[index].checked = checked;
                }
            });
            // abort here
            return;
        }
        if (setValue) {
            checkbox.checked = checked
        }
        // write value back to element
        me.checkboxes.map((field, index) => {
            if (field.name == fieldname) {
                me.checkboxes[index].checked = checkbox.checked;
            }
        });
        // return element
        return checkbox;
    };
    /** Load Checkbox Description **/
    CookieConsent.prototype.loadContentDescription = function () {
        let cookieDesc = DPCookieConsent.getCookieElementsByTag('script', 'data-dp-cookieDesc');
        if (cookieDesc.length > 0) {
            cookieDesc = cookieDesc[0].innerHTML;
        } else {
            cookieDesc = description;
        }

        window.cookieconsent_options.content.cookieDesc = this.replaceLabels(cookieDesc);
    };
    /** Load Revoke Button **/
    CookieConsent.prototype.loadContentRevoke = function () {
        let revokeBtn = DPCookieConsent.getCookieElementsByTag('script', 'data-dp-cookieRevoke');
        if (revokeBtn.length > 0) {
            window.cookieconsent_options.revokeBtn = revokeBtn[0].innerHTML;
        } else {
            window.cookieconsent_options.revokeBtn = revokebutton;
        }
    };
    /** default Setting **/
    CookieConsent.prototype.defaults = function () {
        window.cookieconsent_options = merger(this.settings, window.cookieconsent_options);
        // if Wire style change button style
        if (window.cookieconsent_options.theme == 'wire') {
            window.cookieconsent_options.palette.button.border = window.cookieconsent_options.palette.button.background;
            window.cookieconsent_options.palette.button.background = 'transparent';
        }
        // remove theme block if block or wire
        if (['block', 'wire'].indexOf(window.cookieconsent_options.theme) != -1) {
            delete window.cookieconsent_options.theme;
        }
        // overwrite Cookie settings
        if (typeof window.cookieconsent_options_cookie != 'undefined') {
            this.cookie = merger(this.cookie, window.cookieconsent_options_cookie);
            console.log(this.cookie);
        }
    };
    /** Init Cookie Plugin **/
    CookieConsent.prototype.init = function () {
        var me = this;
        // set Defaults
        me.defaults();
        // Load Cookie Consent
        require('./vendor/cookieconsent');
        // load Cookie Desc
        me.loadContentDescription('data-dp-cookieDesc', description);
        // Load Revoke Button
        me.loadContentRevoke('data-dp-cookieRevoke', revokebutton);
        // init checkbox configuration
        if (window.cookieconsent_options.layout == 'dpextend') {
            me.initCheckboxes();
        }
        /** Bind Self to Handler Class Funktions **/
        var options = {
            autoOpen: window.cookieconsent_options.autoOpen,
            content: window.cookieconsent_options.content,
            theme: window.cookieconsent_options.theme,
            position: window.cookieconsent_options.position,
            palette: window.cookieconsent_options.palette,
            dismissOnScroll: window.cookieconsent_options.dismissOnScroll,
            type: window.cookieconsent_options.type,
            layout: window.cookieconsent_options.layout,
            revokable: window.cookieconsent_options.revokable,
            cookie: window.DPCookieConsent.cookie,
            layouts: {
                'dpextend': dpextend,
            },
            elements: {
                'messagelink': messagelink,
                'dpmessagelink': dpmessagelink,
                'allow-all': allowAll,
            },
            revokeBtn: window.cookieconsent_options.revokeBtn,
            compliance: {
                'opt-in': optIn
            },

            onPopupOpen: function () {
                // set Body Class
                window.DPCookieConsent.setClass();
                // load Checkboxes
                window.DPCookieConsent.loadCheckboxes();
            },
            onPopupClose: function () {
                // remove Body Class
                window.DPCookieConsent.setClass(true);
            },
            onInitialise: function (status) {
                if (this.hasConsented() && (status == 'dismiss' || status == 'allow')) {
                    // load Checkboxes
                    window.DPCookieConsent.loadCheckboxes();
                    // set falags
                    window.DPCookieConsent.loadCookies();
                    window.DPCookieConsent.fireEvent('dp--cookie-accept-init');
                }
            },
            onStatusChange: function (status) {
                // set all checkboxes
                if (window.cookieconsent_options.type == 'opt-in' &&
                    window.cookieconsent_options.layout === 'dpextend' &&
                    status == 'dismiss'
                ) {
                    var checkboxes = window.DPCookieConsent.checkboxes;
                    // loop checkboxes
                    checkboxes.map(function (checkbox) {
                        // set checkboxes to true
                        window.DPCookieConsent.loadCheckbox(checkbox.name, false, true);
                    })
                }
                // save checkboxes
                window.DPCookieConsent.setCheckboxes();
                // load cookies
                if (this.hasConsented() && (status == 'dismiss' || status == 'allow')) {
                    var reload = false;
                    // force reload check
                    if (window.DPCookieConsent.settings.reloadOnRevoke && window.DPCookieConsent.prevCheckboxes) {
                        window.DPCookieConsent.prevCheckboxes.map((box, index) => {
                            // has checked changed?
                            var current = window.DPCookieConsent.checkboxes[index];
                            if (box.checked === true) {
                                if (!current || current.checked == false) {
                                    // set reload flag
                                    reload = true;
                                }
                            }
                        });
                    }
                    // load handling
                    window.DPCookieConsent.loadCookies();
                    window.DPCookieConsent.fireEvent('dp--cookie-accept');
                    // check reload status
                    if (reload) {
                        // reload page
                        location.reload();
                    }
                } else {
                    window.DPCookieConsent.fireEvent('dp--cookie-deny');
                }
            },
            onRevokeChoice: function () {
                window.DPCookieConsent.fireEvent('dp--cookie-revoke');
            }
        };
        // Bind Popup Event
        var complete = function (popup) {
            // store popup
            window.DPCookieConsent.setPopup(popup);
            // init overlays
            window.DPCookieConsent.overlays();
            // fire event when the initialization process is completed
            window.DPCookieConsent.fireEvent('dp--cookie-init');
        };
        // init Consent
        window.cookieconsent.initialise(options, complete);
    };
    /**
     * Set Popup window of CookieConsent
     * @param popup
     */
    CookieConsent.prototype.setPopup = function (popup) {
        this.popup = popup;
    };
    /**
     * Hook Allow Cookies
     */
    CookieConsent.prototype.forceAccept = function (element) {
        var me = this;
        if (typeof me.popup != "undefined") {
            setTimeout(function () {
                if (window.cookieconsent_options.layout === 'dpextend') {
                    // load pref Status
                    me.loadCheckboxes();
                    var type = element.getAttribute('data-cookieconsent');
                    me.checkboxes.map((checkbox, index) => {
                        if (checkbox.name == type) {
                            me.loadCheckbox(checkbox.name, false, true);
                        } else if (!me.popup.hasAnswered()) {
                            me.loadCheckbox(checkbox.name, false, false);
                        }
                    });
                }
                // accept consent and Close overlay
                me.popup.setStatus(window.cookieconsent.status.allow);
                me.popup.close(true);
            }, 250);
        }
    };
    /**
     * Hook deny Cookies
     */
    CookieConsent.prototype.forceDeny = function (element) {
        var me = this;
        if (typeof me.popup != "undefined") {
            setTimeout(function () {
                if (window.cookieconsent_options.layout === 'dpextend') {
                    // load pref Status
                    me.loadCheckboxes();
                    var type = element.getAttribute('data-cookieconsent');
                    me.checkboxes.map((checkbox, index) => {
                        if (checkbox.name == type) {
                            me.loadCheckbox(checkbox.name, false, false);
                        }
                    });
                }
                // deny consent and Close overlay
                me.popup.setStatus(window.cookieconsent.status.deny);
                me.popup.close(true);
            }, 250);
        }
    };
    /**
     *  create event
     */
    CookieConsent.prototype.fireEvent = function (name, element) {
        var event;
        if (element) {
            event = document.createEvent('CustomEvent');
            event.initCustomEvent(name, true, true, {
                $el: element
            });
        } else {
            event = document.createEvent('Event');
            event.initEvent(name, true, true);
        }
        // fire Event
        document.dispatchEvent(event);
    };
    /**
     * create Overlays
     */
    CookieConsent.prototype.overlays = function () {
        // check if active
        if (!window.cookieconsent_options.overlay.notice) return;
        // elements iFrame
        var elements = this.getCookieElementsByTag('iframe');
        // get overlay Template
        let iframeoverlayHtml = DPCookieConsent.getCookieElementsByTag('script', 'data-dp-cookieIframe');
        if (iframeoverlayHtml.length > 0) {
            iframeoverlayHtml = iframeoverlayHtml[0].innerHTML;
        } else {
            iframeoverlayHtml = iframeoverlay;
        }
        // loop elements and create overlay
        if (elements.length > 0) {
            var key;
            /** Loop through elements and run Code **/
            for (key = 0; key < elements.length; key++) {
                var element = elements[key],
                    notice = element.getAttribute('data-cookieconsent-notice') || window.cookieconsent_options.content.media.notice,
                    desc = element.getAttribute('data-cookieconsent-description') || window.cookieconsent_options.content.media.desc,
                    btn = element.getAttribute('data-cookieconsent-btn') || window.cookieconsent_options.content.media.btn,
                    type = element.getAttribute('data-cookieconsent');
                // check if overlay is already done
                if(element.hasAttribute('data-cookieconsent-overlay-loaded')) continue;
                // mark as done
                element.setAttribute('data-cookieconsent-overlay-loaded', 'loaded');
                // create overlay
                var div = document.createElement('div');
                div.classList.add("dp--overlay");
                // Button Style
                var style = '';
                if (window.cookieconsent_options.overlay.btn.background) {
                    style += 'background:' + window.cookieconsent_options.overlay.btn.background + ';';
                }
                if (window.cookieconsent_options.overlay.btn.text) {
                    style += 'color:' + window.cookieconsent_options.overlay.btn.text + ';';
                }
                // create HTML
                iframeoverlayHtml = iframeoverlayHtml
                    .replace('{{notice}}', notice)
                    .replace('{{desc}}', desc)
                    .replace('{{type}}', type)
                    .replace('{{style}}', 'style="' + style + '"')
                    .replace('{{btn}}', btn);

                // prepare for link edit
                if (typeof window.cookieconsent_options.content != 'undefined') {
                    if (typeof window.cookieconsent_options.content.target != 'undefined') iframeoverlayHtml = iframeoverlayHtml.replace('{{target}}', window.cookieconsent_options.content.target);
                    if (typeof window.cookieconsent_options.content.href != 'undefined') iframeoverlayHtml = iframeoverlayHtml.replace('{{href}}', window.cookieconsent_options.content.href);
                    if (typeof window.cookieconsent_options.content.link != 'undefined') iframeoverlayHtml = iframeoverlayHtml.replace('{{link}}', window.cookieconsent_options.content.link);
                }
                // place html
                div.innerHTML = iframeoverlayHtml
                // add background color
                if (window.cookieconsent_options.overlay.box.background) {
                    div.style.background = window.cookieconsent_options.overlay.box.background;
                }
                // add Text Color
                if (window.cookieconsent_options.overlay.box.text) {
                    div.style.color = window.cookieconsent_options.overlay.box.text;
                }
                // add Element to DOM
                element.parentNode.insertBefore(div, element.nextSibling);
            }
        }
    };
    /** Init Handler **/
    window.DPCookieConsent = new CookieConsent();
    /** Start Script Handling **/
    window.DPCookieConsent.init();
});
