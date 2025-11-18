const fs = require('fs');
const path = require('path');

const portfoliosDir = 'public/resources/img/portfolios';

function parseSummaryTxt(content) {
    // Handle both Windows (\r\n) and Unix (\n) line endings
    const normalizedContent = content.replace(/\r\n/g, '\n');
    const sections = normalizedContent.split('\n\n\n').filter(s => s.trim());
    const data = {};

    sections.forEach(section => {
        const lines = section.split('\n');
        const header = lines[0].trim();
        const body = lines.slice(1).join('\n').trim();

        if (header === 'Short Summary') {
            data.description = body;
        } else if (header === 'Tools') {
            data.tools = body;
        } else if (header === 'Author') {
            data.client = body;
        } else if (header === 'Link') {
            data.linkText = body;
        }
    });

    return data;
}

function getCategory(tools) {
    if (!tools) return 'make'; // default if tools is undefined
    if (tools.includes('Make.com')) return 'make';
    if (tools.includes('Zapier')) return 'zapier';
    if (tools.includes('Airtable')) return 'airtable';
    if (tools.includes('n8n')) return 'n8n';
    return 'make'; // default
}

function getImages(folderPath) {
    const files = fs.readdirSync(folderPath);
    const images = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file)).sort();
    return images.map(img => `public/resources/img/portfolios/${path.basename(folderPath)}/${img}`);
}

function generatePortfolioHTML(projects) {
    const slides = [];
    const projectsPerSlide = 9;
    
    for (let i = 0; i < projects.length; i += projectsPerSlide) {
        const slideProjects = projects.slice(i, i + projectsPerSlide);
        
        // Add placeholder if needed to fill the slide
        while (slideProjects.length < projectsPerSlide && i === 0) {
            slideProjects.push({
                isPlaceholder: true
            });
        }
        
        const slideHTML = `
                            <div class="swiper-slide">
                                <div class="projects-grid">
${slideProjects.map(project => {
    if (project.isPlaceholder) {
        return `                                    <div class="mix make placeholder" style="opacity: 0.3;">
                                        <div style="background: #333; height: 200px; display: flex; align-items: center; justify-content: center; color: #666;">
                                            <span>More Projects Coming Soon</span>
                                        </div>
                                        <span class="title">Future Project</span>
                                        <span class="port_link">Coming Soon</span>
                                    </div>`;
    }
    return `                                    <div class="mix ${project.category}" data-id="${project.id}" data-description="${project.description.replace(/"/g, '"')}" data-tools="${project.tools}" data-author="${project.client}" data-link="${project.link}" data-images='${JSON.stringify(project.screenshots)}'>
                                        <img src="${project.tileImage}" alt="" />
                                        <span class="title">${project.title}</span>
                                        <span class="port_link">View Details</span>
                                    </div>`;
}).join('\n')}
                                </div>
                            </div>`;
        
        slides.push(slideHTML);
    }
    
    return slides.join('\n');
}

function generatePortfolioJS(projects) {
    // No longer needed as we use data attributes
    return '';
}

function main() {
    const folders = fs.readdirSync(portfoliosDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const projects = [];

    folders.forEach(folder => {
        const folderPath = path.resolve(portfoliosDir, folder);
        const summaryPath = path.join(folderPath, 'Summary.txt');

        if (!fs.existsSync(summaryPath)) {
            console.log(`Skipping ${folder}: Summary.txt not found`);
            return;
        }

        const summaryContent = fs.readFileSync(summaryPath, 'utf8');
        const summaryData = parseSummaryTxt(summaryContent);

        const images = getImages(folderPath);
        const tileImage = images.find(img => path.basename(img).startsWith('0.')) || images[0];

        const title = folder.replace(/_/g, ' '); // Assuming folder names use underscores for spaces if needed

        const category = getCategory(summaryData.tools);

        let link = '#';
        if (summaryData.linkText && summaryData.linkText.includes('Documentation')) {
            // First try the expected naming convention
            const docName = `${folder.replace(/ /g, '_')}_Doc.pdf`;
            const docPath = path.join(folderPath, docName);
            if (fs.existsSync(docPath)) {
                link = `public/resources/img/portfolios/${folder}/${docName}`;
            } else {
                // Fallback to any PDF file in the folder, case-insensitive match
                const files = fs.readdirSync(folderPath);
                const pdfFile = files.find(file => file.toLowerCase().endsWith('.pdf'));
                if (pdfFile) {
                    link = `public/resources/img/portfolios/${folder}/${pdfFile}`;
                }
            }
        }

        const id = folder.toLowerCase().replace(/ /g, '-');

        projects.push({
            id,
            title,
            description: summaryData.description || '',
            tools: summaryData.tools || '',
            client: summaryData.client || '',
            link,
            category,
            tileImage,
            screenshots: images
        });
    });

    // Generate HTML
    const portfolioHTML = generatePortfolioHTML(projects);

    // Generate JS
    const portfolioJS = generatePortfolioJS(projects);

    // Read portfolio.html
    let indexContent = fs.readFileSync('portfolio.html', 'utf8');

    // Replace portfolio swiper-wrapper content
    const portfolioSwiperRegex = /<div class="swiper-container-portfolio">[\s\S]*?<div class="swiper-pagination"><\/div>/;
    const newPortfolioSwiper = `<div class="swiper-container-portfolio">
                        <div class="swiper-wrapper">
${portfolioHTML}
                        </div>
                        <div class="swiper-pagination"></div>`;
    indexContent = indexContent.replace(portfolioSwiperRegex, newPortfolioSwiper);

    // Write back
    fs.writeFileSync('portfolio.html', indexContent);

    console.log('Portfolio updated successfully!');
}

main();
