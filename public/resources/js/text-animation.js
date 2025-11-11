function animateText() {
    const textElement = document.getElementById('animated-text');
    const originalHTML = textElement.innerHTML;
    
    // Split text into letters while preserving HTML tags
    let letters = [];
    let tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalHTML;
    
    function extractLetters(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            for (let i = 0; i < text.length; i++) {
                if (text[i].trim() !== '') {
                    letters.push(text[i]);
                } else {
                    letters.push(' ');
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'B') {
                for (let child of node.childNodes) {
                    extractLetters(child);
                }
            } else {
                for (let child of node.childNodes) {
                    extractLetters(child);
                }
            }
        }
    }
    
    for (let child of tempDiv.childNodes) {
        extractLetters(child);
    }
    
    // Clear original text
    textElement.innerHTML = '';
    
    // Create letter spans
    const letterSpans = letters.map((letter, index) => {
        const span = document.createElement('span');
        span.className = 'letter';
        span.textContent = letter;
        span.style.animationDelay = `${index * 20}ms`;
        textElement.appendChild(span);
        return span;
    });
    
    // Scatter animation
    setTimeout(() => {
        letterSpans.forEach((span, index) => {
            span.classList.add('scattered');
            const x = (Math.random() - 0.5) * window.innerWidth;
            const y = (Math.random() - 0.5) * window.innerHeight;
            span.style.transform = `translate(${x}px, ${y}px) rotate(${Math.random() * 360}deg)`;
            span.style.opacity = '0.3';
        });
    }, 100);
    
    // Reassemble animation
    setTimeout(() => {
        letterSpans.forEach((span, index) => {
            setTimeout(() => {
                span.classList.remove('scattered');
                span.style.transform = 'translate(0, 0) rotate(0deg)';
                span.style.opacity = '1';
                span.style.position = 'relative';
            }, index * 50);
        });
    }, 2000);
    
    // Restore original HTML with bold tags
    setTimeout(() => {
        textElement.innerHTML = originalHTML;
    }, 2000 + letterSpans.length * 50 + 500);
}

// Trigger animation when about tab is clicked
document.addEventListener('DOMContentLoaded', function() {
    const aboutNavLinks = document.querySelectorAll('.about_nav a');
    aboutNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.textContent.trim() === 'Skills') {
                setTimeout(animateText, 300);
            }
        });
    });
});