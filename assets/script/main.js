"use strict";

let navButton = document.querySelector('nav button');

navButton && navButton.addEventListener('click', function() {
    let expanded = this.getAttribute('aria-expanded') === 'true' || false;
    this.setAttribute('aria-expanded', !expanded);
    let menu = this.nextElementSibling;
    menu.hidden = !menu.hidden;
});

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ //

let cards = document.querySelectorAll('.card-wrap');
cards.forEach(card => {
    let mouseX  = 0;
    let mouseY  = 0;
    let mousePX = 0;
    let mousePY = 0;
    let theCard = card.querySelector('.card');
    let cardBg = card.querySelector('.card-bg');
    let mouseLeaveDelay;
    let bgImage = cardBg.attributes['data-image'].value;
    cardBg.style.backgroundImage = `url(${bgImage})`;

    card.addEventListener('mousemove', e => {

        mouseX = e.pageX - card.offsetLeft - card.offsetWidth/2;
        mouseY = e.pageY - card.offsetTop - card.offsetHeight/2;

        mousePX = mouseX / card.offsetWidth;
        mousePY = mouseY / card.offsetHeight;

        theCard.style.transform = `rotateY(${mousePX * 30}deg) rotateX(${mousePY * -30}deg)`;
        cardBg.style.transform  = `translateX(${mousePX * -40}px) translateY(${mousePY * -40}px)`;

    });
    card.addEventListener('mouseenter', e => clearTimeout(mouseLeaveDelay));
    card.addEventListener('mouseleave', e => {
        mouseLeaveDelay = setTimeout(()=>{
            mouseX = 0;
            mouseY = 0;

            theCard.style.transform = `rotateY(0deg) rotateX(0deg)`
            cardBg.style.transform  = `translateX(0px) translateY(0px)`;
        }, 600)
    });

});
