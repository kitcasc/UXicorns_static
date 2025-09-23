(function ($) {
  "use strict";
  //Loading AOS animation with css class

  //fade animation
  $(".woxstore-fade-up").attr({
    "data-aos": "fade-up",
  });
  $(".woxstore-fade-down").attr({
    "data-aos": "fade-down",
  });
  $(".woxstore-fade-left").attr({
    "data-aos": "fade-left",
  });
  $(".woxstore-fade-right").attr({
    "data-aos": "fade-right",
  });
  $(".woxstore-fade-up-right").attr({
    "data-aos": "fade-up-right",
  });
  $(".woxstore-fade-up-left").attr({
    "data-aos": "fade-up-left",
  });
  $(".woxstore-fade-down-right").attr({
    "data-aos": "fade-down-right",
  });
  $(".woxstore-fade-down-left").attr({
    "data-aos": "fade-down-left",
  });

  //slide animation
  $(".woxstore-slide-left").attr({
    "data-aos": "slide-left",
  });
  $(".woxstore-slide-right").attr({
    "data-aos": "slide-right",
  });
  $(".woxstore-slide-up").attr({
    "data-aos": "slide-up",
  });
  $(".woxstore-slide-down").attr({
    "data-aos": "slide-down",
  });

  //zoom animation
  $(".woxstore-zoom-in").attr({
    "data-aos": "zoom-in",
  });
  $(".woxstore-zoom-in-up").attr({
    "data-aos": "zoom-in-up",
  });
  $(".woxstore-zoom-in-down").attr({
    "data-aos": "zoom-in-down",
  });
  $(".woxstore-zoom-in-left").attr({
    "data-aos": "zoom-in-left",
  });
  $(".woxstore-zoom-in-right").attr({
    "data-aos": "zoom-in-right",
  });
  $(".woxstore-zoom-out").attr({
    "data-aos": "zoom-out",
  });
  $(".woxstore-zoom-out-up").attr({
    "data-aos": "zoom-out-up",
  });
  $(".woxstore-zoom-out-down").attr({
    "data-aos": "zoom-out-down",
  });
  $(".woxstore-zoom-out-left").attr({
    "data-aos": "zoom-out-left",
  });
  $(".woxstore-zoom-out-right").attr({
    "data-aos": "zoom-out-right",
  });

  //flip animation
  $(".woxstore-flip-up").attr({
    "data-aos": "flip-up",
  });
  $(".woxstore-flip-down").attr({
    "data-aos": "flip-down",
  });
  $(".woxstore-flip-left").attr({
    "data-aos": "flip-left",
  });
  $(".woxstore-flip-right").attr({
    "data-aos": "flip-right",
  });

  //animation ease attributes
  $(".woxstore-linear").attr({
    "data-aos-easing": "linear",
  });
  $(".woxstore-ease").attr({
    "data-aos-easing": "ease",
  });
  $(".woxstore-ease-in").attr({
    "data-aos-easing": "ease-in",
  });
  $(".woxstore-ease-in-back").attr({
    "data-aos-easing": "ease-in-back",
  });
  $(".woxstore-ease-out").attr({
    "data-aos-easing": "ease-out",
  });
  $(".woxstore-ease-out-back").attr({
    "data-aos-easing": "ease-out-back",
  });
  $(".woxstore-ease-in-out-back").attr({
    "data-aos-easing": "ease-in-out-back",
  });
  $(".woxstore-ease-in-shine").attr({
    "data-aos-easing": "ease-in-shine",
  });
  $(".woxstore-ease-out-shine").attr({
    "data-aos-easing": "ease-out-shine",
  });
  $(".woxstore-ease-in-out-shine").attr({
    "data-aos-easing": "ease-in-out-shine",
  });
  $(".woxstore-ease-in-quad").attr({
    "data-aos-easing": "ease-in-quad",
  });
  $(".woxstore-ease-out-quad").attr({
    "data-aos-easing": "ease-out-quad",
  });
  $(".woxstore-ease-in-out-quad").attr({
    "data-aos-easing": "ease-in-out-quad",
  });
  $(".woxstore-ease-in-cubic").attr({
    "data-aos-easing": "ease-in-cubic",
  });
  $(".woxstore-ease-out-cubic").attr({
    "data-aos-easing": "ease-out-cubic",
  });
  $(".woxstore-ease-in-out-cubic").attr({
    "data-aos-easing": "ease-in-out-cubic",
  });
  $(".woxstore-ease-in-quart").attr({
    "data-aos-easing": "ease-in-quart",
  });
  $(".woxstore-ease-out-quart").attr({
    "data-aos-easing": "ease-out-quart",
  });
  $(".woxstore-ease-in-out-quart").attr({
    "data-aos-easing": "ease-in-out-quart",
  });

  setTimeout(function () {
    AOS.init({
      once: true,
      duration: 1200,
    });
  }, 100);

  $(window).scroll(function () {
    var scrollTop = $(this).scrollTop();
    var woxstoreStickyMenu = $(".woxstore-sticky-menu");
    var woxstoreStickyNavigation = $(".woxstore-sticky-navigation");

    if (woxstoreStickyMenu.length && scrollTop > 0) {
      woxstoreStickyMenu.addClass("sticky-menu-enabled woxstore-zoom-in-up");
    } else {
      woxstoreStickyMenu.removeClass("sticky-menu-enabled");
    }
  });
  jQuery(window).scroll(function () {
    if (jQuery(this).scrollTop() > 100) {
      jQuery(".woxstore-scrollto-top a").fadeIn();
    } else {
      jQuery(".woxstore-scrollto-top a").fadeOut();
    }
  });
  jQuery(".woxstore-scrollto-top a").click(function () {
    jQuery("html, body").animate({ scrollTop: 0 }, 600);
    return false;
  });

  /* Featured Slider */
  var woxstoreSlider = new Swiper(".woxstore-slider", {
    slidesPerView: 1,
    speed: 1000,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".woxstore-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".woxstore-button-next",
      prevEl: ".woxstore-button-prev",
    },
  });
})(jQuery);
