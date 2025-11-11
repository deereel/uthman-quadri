const aboutNavButtons = document.querySelectorAll(".about_nav a");
const aboutContainer = document.querySelector(".about_container");

function resetActiveState() {
    aboutNavButtons.forEach((button) => button.classList.remove("active"));
    ["one", "two", "three"].forEach((className) =>
        aboutContainer.classList.remove(className)
    );
}

function handleButtonClick(button) {
    const className = button.dataset.text;

    resetActiveState();

    button.classList.add("active");
    aboutContainer.classList.add(className);
}

aboutNavButtons.forEach((button) => {
    button.addEventListener("click", () => handleButtonClick(button));
});

// Initialize with first section active
aboutContainer.classList.add("one");

// Global function to trigger animation when about section loads
window.triggerAboutAnimation = function() {
    setTimeout(animateText, 500);
};

function animateText() {
    const textElement = document.getElementById('animated-text');
    const originalHTML = textElement.innerHTML;
    const text = textElement.textContent;
    
    // Clear and create letter spans
    textElement.innerHTML = '';
    const letters = text.split('').map((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter;
        textElement.appendChild(span);
        return span;
    });
    
    // Scatter letters
    setTimeout(() => {
        letters.forEach(span => {
            span.classList.add('scattered');
            const x = (Math.random() - 0.5) * window.innerWidth;
            const y = (Math.random() - 0.5) * window.innerHeight;
            span.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
            span.style.opacity = '0.3';
        });
    }, 100);
    
    // Reassemble letters
    setTimeout(() => {
        letters.forEach((span, index) => {
            setTimeout(() => {
                span.classList.remove('scattered');
                span.style.transform = 'translate(0, 0) rotate(0deg)';
                span.style.opacity = '1';
                span.style.position = 'relative';
            }, index * 30);
        });
    }, 1500);
    
    // Restore original HTML
    setTimeout(() => {
        textElement.innerHTML = originalHTML;
    }, 1500 + letters.length * 30 + 300);
}
