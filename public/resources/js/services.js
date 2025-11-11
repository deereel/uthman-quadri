// Project data from the projects page
const projects = [
    { name: 'Client Onboarding Automation', img: 'public/resources/img/portfolios/app/1.jpg' },
    { name: 'Sales Follow-Up System', img: 'public/resources/img/portfolios/web/2.jpg' },
    { name: 'CRM + Email Integration', img: 'public/resources/img/portfolios/card/1.jpg' },
    { name: 'Custom API Data Sync', img: 'public/resources/img/portfolios/logo/1.jpg' },
    { name: 'E-commerce Order Processing', img: 'public/resources/img/portfolios/web/1.jpg' },
    { name: 'Lead Qualification Workflow', img: 'public/resources/img/portfolios/card/2.jpg' },
    { name: 'Project Management Hub', img: 'public/resources/img/portfolios/web/3.jpg' },
    { name: 'Multi-Platform Data Pipeline', img: 'public/resources/img/portfolios/card/3.jpg' },
    { name: 'Invoice & Payment Automation', img: 'public/resources/img/portfolios/web/4.jpg' },
    { name: 'Social Media Scheduler', img: 'public/resources/img/portfolios/card/4.jpg' },
    { name: 'Inventory Management System', img: 'public/resources/img/portfolios/logo/2.jpg' },
    { name: 'HR Onboarding Workflow', img: 'public/resources/img/portfolios/logo/3.jpg' }
];

function getTwiceDaily Seed() {
    const now = new Date();
    const hour = now.getHours();
    const period = hour < 12 ? 0 : 1; // 0 for AM, 1 for PM
    return now.getFullYear() * 100000 + (now.getMonth() + 1) * 1000 + now.getDate() * 10 + period;
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

function getRandomProjects() {
    const seed = getTwiceDailySeed();
    const shuffled = [...projects];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(seededRandom(seed + i) * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    return shuffled.slice(0, 3);
}

function updateFooterProjects() {
    const footLinks = document.querySelectorAll('.services .foot-link');
    const randomProjects = getRandomProjects();
    
    footLinks.forEach((link, index) => {
        if (randomProjects[index]) {
            const anchor = link.querySelector('a');
            const img = link.querySelector('img');
            
            anchor.textContent = randomProjects[index].name;
            img.src = randomProjects[index].img;
        }
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', updateFooterProjects);