"use strict";

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
if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/serviceworker.js')
    .then((registration) => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
    }, (error) => {
        console.log('ServiceWorker registration failed: ', error);
    });
}

let togglers = document.querySelectorAll('.toggle-runs');
togglers.forEach(toggler => {
    toggler.addEventListener('click', e => {
        toggler.nextSibling.hidden = !toggler.nextSibling.hidden;
    })
});
