"use strict";

document.getElementsByTagName("html")[0].className += " js";

/**
 * Source: https://stackoverflow.com/questions/27078285/simple-throttle-in-js
 */
function throttle(callback, limit) {
    let wait = false;
    return function () {
        if (!wait) {
            callback.apply(null, arguments);
            wait = true;
            setTimeout(function () {
                wait = false;
            }, limit);
        }
    }
}

/*
let navButton = document.querySelector('nav button');

navButton && navButton.addEventListener('click', function() {
    let expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', !expanded);
    let menu = this.nextElementSibling;
    menu.hidden = !menu.hidden;
});
//*/

/**
 * Adapted from Parallax Depth Cards by Andy Merskin
 * Inspired by Gwent and Magic: the Gathering Arena games
 *
 * See: https://codepen.io/andymerskin/pen/XNMWvQ
 */
let cards = document.querySelectorAll('.card-wrap');
let animate = true;

cards.forEach(card => {
    let mouseX  = 0;
    let mouseY  = 0;
    let mousePX = 0;
    let mousePY = 0;
    let theCard = card.querySelector('.card');
    let cardBg  = card.querySelector('.card__bg');
    let mouseLeaveDelay;
    let bgImage = cardBg.attributes['data-image'].value;
    cardBg.style.backgroundImage = `url(${bgImage})`;

    if (! animate) {
        return;
    }
    card.addEventListener('mousemove', throttle(function(e) {
        mouseX = e.pageX - card.offsetLeft - card.offsetWidth/2;
        mouseY = e.pageY - card.offsetTop - card.offsetHeight/2;

        mousePX = mouseX / card.offsetWidth;
        mousePY = mouseY / card.offsetHeight;

        theCard.style.transform = `rotateY(${mousePX * 30}deg) rotateX(${mousePY * -30}deg)`;
        cardBg.style.transform  = `translateX(${mousePX * -40}px) translateY(${mousePY * -40}px)`;

    }, 50));

    card.addEventListener('mouseenter', e => clearTimeout(mouseLeaveDelay));
    card.addEventListener('mouseleave', e => {
        mouseLeaveDelay = setTimeout(() => {
            mouseX = 0;
            mouseY = 0;

            theCard.style.transform = `rotateY(0deg) rotateX(0deg)`
            cardBg.style.transform  = `translateX(0px) translateY(0px)`;
        }, 600)
    });
});

Array.prototype.forEach.call(cards, card => {
    let down;
    let up;
    let link = card.querySelector('h2 a');

    card.onmousedown = () => down = +new Date();
    card.onmouseup = () => {
        up = +new Date();
        if ((up - down) < 200) {
            link.click();
        }
    }
});

/**
 * Based on Jeremy Keith's presentation "Going Offline"
 *
 * See: https://speaking.adactio.com/IKpZLN/going-offline
 * See: https://developers.google.com/web/fundamentals/primers/service-workers/
 */
/* -- still buggy`serviceworker.js`, so disable for now.
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/serviceworker.js')
    .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (error) => {
        console.log('ServiceWorker registration failed: ', error);
    });
}
//*/

let togglers = document.querySelectorAll('.toggle-runs');
togglers.forEach(toggler => {
    toggler.addEventListener('click', e => {
        toggler.nextSibling.hidden = !toggler.nextSibling.hidden;
    })
});

document.querySelectorAll('.tablesort').forEach(tablesort => {
    new Tablesort(tablesort);
});

/*
MicroModal.init({
    onShow: modal => {
        let iframe = modal.getElementsByTagName('iframe')[0];
        if (! iframe.src) {
            iframe.src = iframe.dataset['src'];
        }
    },
    onClose: modal => {
        alert('ok');
        let iframe = modal.getElementsByTagName('iframe')[0];
        iframe.src = iframe.dataset['src'];
    }
});
//*/

function createAd()
{
    let adString = '<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-1456489391618538" data-ad-slot="5354626624" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    return document.createRange().createContextualFragment(adString);
}

document.querySelectorAll('[data-micromodal]').forEach(button => {
    let micromodal = document.getElementById('micromodal');
    let titleElem  = micromodal.getElementsByTagName('h3')[0];
    let iframeElem = micromodal.getElementsByTagName('iframe')[0];

    button.addEventListener('click', e => {
        let button = e.currentTarget;
        titleElem.textContent = button.dataset['micromodalTitle'];
        iframeElem.src = button.dataset['micromodalEmbed'];

        MicroModal.show('micromodal', {
            onClose: modal => {
                let iframe = modal.getElementsByTagName('iframe')[0];
                iframe.src = iframe.dataset['src'];
            }
        });

        if (typeof ga !== 'undefined') {
            // ga('send', 'event', 'Video', 'play', button.dataset['micromodalTitle']);
            gtag('event', 'play', {
                'event_category': 'Video',
                'event_label': button.dataset['micromodalTitle']
              });

            let container = micromodal.getElementsByClassName('modal__container')[0];

            for (let item of container.getElementsByTagName('ins')) {
                item.remove()
            }
            let ad = createAd();
            container.append(ad);
            (adsbygoogle = window.adsbygoogle || []).push({});
        }
    });

});

// Filter for runs on Quest page

let filters = document.querySelectorAll('.filters select');
let results = document.querySelectorAll('.tablesort tbody tr');

filters.forEach(select => {
    select.addEventListener('change', e => {
        results.forEach(row => row.hidden = false);
        filters.forEach(filter => {
            let name  = filter.name;
            let value = filter.value;

            if (value) {
                results.forEach(row => {
                    /**
                     * When filtering on weapons, show runs that only have that single weapon.
                     */
                    // if only one needs to be true:
                    // if (! row.dataset[name].split(' ').includes(value)) {
                    // if it needs to be exact:
                    if (row.dataset[name] != value) {
                        row.hidden = true;
                    }
                });
            }
        });
    });
});

/**
 * Tabs
 * ----
 * See: https://inclusive-components.design/tabbed-interfaces/
 * Source: https://codepen.io/heydon/pen/veeaEa
 */
(function () {
    // Get relevant elements and collections
    const tabbed = document.querySelector('.tabbed');
    if (tabbed == null) return;

    const tablist = tabbed.querySelector('ul');
    const tabs = tablist.querySelectorAll('a');
    const panels = tabbed.querySelectorAll('[id^="section"]');

    // The tab switching function
    const switchTab = (oldTab, newTab) => {
        newTab.focus();
        // Make the active tab focusable by the user (Tab key)
        newTab.removeAttribute('tabindex');
        // Set the selected state
        newTab.setAttribute('aria-selected', 'true');
        oldTab.removeAttribute('aria-selected');
        oldTab.setAttribute('tabindex', '-1');
        // Get the indices of the new and old tabs to find the correct
        // tab panels to show and hide
        let index = Array.prototype.indexOf.call(tabs, newTab);
        let oldIndex = Array.prototype.indexOf.call(tabs, oldTab);
        panels[oldIndex].hidden = true;
        panels[index].hidden = false;
    }

    // Add the tablist role to the first <ul> in the .tabbed container
    tablist.setAttribute('role', 'tablist');

    // Add semantics are remove user focusability for each tab
    Array.prototype.forEach.call(tabs, (tab, i) => {
        tab.setAttribute('role', 'tab');
        tab.setAttribute('id', 'tab' + (i + 1));
        tab.setAttribute('tabindex', '-1');
        tab.parentNode.setAttribute('role', 'presentation');

        // Handle clicking of tabs for mouse users
        tab.addEventListener('click', e => {
            e.preventDefault();
            let currentTab = tablist.querySelector('[aria-selected]');
            if (e.currentTarget !== currentTab) {
                switchTab(currentTab, e.currentTarget);
            }
        });

        // Handle keydown events for keyboard users
        tab.addEventListener('keydown', e => {
            // Get the index of the current tab in the tabs node list
            let index = Array.prototype.indexOf.call(tabs, e.currentTarget);
            // Work out which key the user is pressing and
            // Calculate the new tab's index where appropriate
            let dir = e.which === 37 ? index - 1 : e.which === 39 ? index + 1 : e.which === 40 ? 'down' : null;
            if (dir !== null) {
                e.preventDefault();
                // If the down key is pressed, move focus to the open panel,
                // otherwise switch to the adjacent tab
                dir === 'down' ? panels[i].focus() : tabs[dir] ? switchTab(e.currentTarget, tabs[dir]) : void 0;
            }
        });
    });

    // Add tab panel semantics and hide them all
    Array.prototype.forEach.call(panels, (panel, i) => {
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('tabindex', '-1');
        let id = panel.getAttribute('id');
        panel.setAttribute('aria-labelledby', tabs[i].id);
        panel.hidden = true;
    });

    // Initially activate the first tab and reveal the first tab panel
    tabs[0].removeAttribute('tabindex');
    tabs[0].setAttribute('aria-selected', 'true');
    panels[0].hidden = false;
})();

// --------------------------------------------------------------------------------

// Google Analytics
window.dataLayer = window.dataLayer || [];

function gtag(){
    dataLayer.push(arguments);
}
gtag('js', new Date());
gtag('config', 'UA-144639528-1', { 'anonymize_ip': true });

// Google Ads
// (adsbygoogle = window.adsbygoogle || []).push({});


// NitroAds
window["nitroAds"] = window["nitroAds"] || {
    createAd: function() {
        window.nitroAds.queue.push(["createAd", arguments]);
    },
    queue: []
};

// GDPR
if (window["nitroAds"] && window["nitroAds"].loaded) {
    document.getElementById("consent-box").style.display = window["__cmp"] ? "" : "none";
} else {
    document.addEventListener("nitroAds.loaded", () =>
        (document.getElementById("consent-box").style.display = window["__cmp"] ? "" : "none")
    );
}

window['nitroAds'].createAd('placement-horizontal', {
    "refreshLimit": 10,
    "refreshTime": 90,
    "renderVisibleOnly": false,
    "refreshVisibleOnly": true,
    "sizes": [
        [ 970, 90 ]
    ],
    "report": {
        "enabled": true,
        "wording": "Report Ad",
        "position": "top-right"
    }
});

window['nitroAds'].createAd('placement-square', {
    "refreshLimit": 10,
    "refreshTime": 90,
    "renderVisibleOnly": false,
    "refreshVisibleOnly": true,
    "sizes": [
        [ 300, 250 ]
    ],
    "report": {
        "enabled": true,
        "wording": "Report Ad",
        "position": "top-right"
    }
});

window['nitroAds'].createAd('placement-horizontal-1', { "refreshLimit": 10, "refreshTime": 90, "renderVisibleOnly": false, "refreshVisibleOnly": true, "sizes": [ [ 970, 90 ] ], "report": { "enabled": true, "wording": "Report Ad", "position": "top-right" } });
window['nitroAds'].createAd('placement-horizontal-2', { "refreshLimit": 10, "refreshTime": 90, "renderVisibleOnly": false, "refreshVisibleOnly": true, "sizes": [ [ 970, 90 ] ], "report": { "enabled": true, "wording": "Report Ad", "position": "top-right" } });
