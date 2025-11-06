/* MAIN.JS
 * --------------------------------------------------
 *  Example JS file with best practices based on a 
 *  podcast from DevTips:
 *  https://www.youtube.com/watch?v=RMiTxHba5fo 
 *  
 *  !IMPORTANT!
 *  gulp-purgecss will remove css for classes that are 
 *  added with JS. You can whitelist these classes 
 *  by adding them in gulpfile.js [line 232]
 * -------------------------------------------------- */
const currentYear = new Date().getFullYear();
let util = UIkit.util;
let totop = util.$("#totop");

document.addEventListener("DOMContentLoaded", () => {
    [].forEach.call(document.querySelectorAll('.current-year'), function (el) {
        el.textContent = currentYear;
    });

    document.body.classList.add('page-loaded');
});

window.addEventListener('load', (event) => {
    if (window.pageYOffset > (window.innerHeight/2)) {
        util.addClass(totop, "uk-active");
    }
});

window.addEventListener("scroll", function() {
    if (window.pageYOffset > (window.innerHeight/2)) {
        util.addClass(totop, "uk-active");
    } else {
        util.removeClass(totop, "uk-active");
    }
}, false);

