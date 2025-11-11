const layers = document.querySelectorAll(".layer");
const container = document.querySelector(".container");
const nav = document.querySelector(".navigation");
const tabs = nav.querySelectorAll("ul li a");
const hamburger = document.querySelector(".hamburger");
let revealText1 = container.querySelector(".layer5 .testimonial h1");

function collapse() {
    layers.forEach((layer) => {
        layer.classList.remove("active");
    });
    if (revealText1) revealText1.classList.remove("reveal");
}

window.home = function() {
    collapse();
    layers[0].classList.add("active");
    updateActiveTab(0);
}

window.about = function() {
    collapse();
    layers[1].classList.add("active");
    updateActiveTab(1);
    
    // Initialize text animation for about section
    setTimeout(() => {
        let aboutText = document.querySelector(".about .content .text");
        if (aboutText && !aboutText.querySelector("span")) {
            aboutText.innerHTML = aboutText.textContent.replace(/\S/g, `<span>$&</span>`);
        }
    }, 100);
}

window.services = function() {
    collapse();
    layers[2].classList.add("active");
    updateActiveTab(2);
}

window.portfolio = function() {
    collapse();
    layers[3].classList.add("active");
    updateActiveTab(3);
}

window.comments = function() {
    collapse();
    layers[4].classList.add("active");
    updateActiveTab(4);
    if (revealText1) revealText1.classList.add("reveal");
}

window.contact = function() {
    collapse();
    layers[5].classList.add("active");
    updateActiveTab(5);
}

function updateActiveTab(activeIndex) {
    tabs.forEach((tab, index) => {
        if (index === activeIndex) {
            tab.classList.add("active");
        } else {
            tab.classList.remove("active");
        }
    });
}

hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    nav.classList.toggle("active");
});

home();

let content = document.querySelector(".content-for-home");
if (content && content.querySelectorAll("p")[0]) {
    content.querySelectorAll("p")[0].innerHTML = content
        .querySelectorAll("p")[0]
        .textContent.replace(/\S/g, `<span>$&</span>`);
}

tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
    });
});