class AirtablePortfolio {
    constructor() {
        this.apiKey = 'patU6popFbTUeRffY.5be688e9a4cdff9af1ff208cecafa3479f485d24e6971fa2b1dd6a970b31f192';
        this.baseId = 'appq3cC3epOtK5jc3';
        this.tableName = 'Projects';
        this.projects = [];
        this.projectsPerSlide = 9;
    }

    async fetchProjects() {
        try {
            console.log('Fetching projects from Airtable...');
            const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}?filterByFormula={Status}='Completed'`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            const data = await response.json();
            console.log('Airtable response:', data);
            this.projects = [];
            
            if (!data.records) {
                console.error('No records found or API error:', data);
                return;
            }
            console.log('Found', data.records.length, 'records');
            
            for (const record of data.records) {
                console.log('Processing record:', record.fields.Title);
                // Parse Summary.txt if available
                let parsedData = {};
                if (record.fields.Summary && record.fields.Summary.length > 0) {
                    try {
                        const summaryResponse = await fetch(record.fields.Summary[0].url);
                        const summaryText = await summaryResponse.text();
                        parsedData = this.parseSummaryTxt(summaryText);
                    } catch (error) {
                        console.error('Error parsing summary:', error);
                    }
                }
                
                // Get categories from parsed data or fallback
                const categories = this.getCategories(parsedData.tools || record.fields.Tools);
                
                // Get documentation link
                const docLink = record.fields.Documentation && record.fields.Documentation.length > 0 
                    ? record.fields.Documentation[0].url : '#';
                
                // Get images
                const images = record.fields.Images ? record.fields.Images.map(img => img.url) : [];
                console.log('Images found:', images.length);
                
                if (images.length === 0) {
                    console.log('Skipping project - no images');
                    continue;
                }
                
                const tileImage = images.find(img => {
                    const filename = img.split('/').pop().split('?')[0];
                    return filename.startsWith('0.');
                }) || images[0] || '';
                
                // Create single project with primary category
                this.projects.push({
                    id: record.fields.Title.toLowerCase().replace(/\s+/g, '-'),
                    title: record.fields.Title,
                    description: parsedData.description || record.fields.Description || '',
                    tools: parsedData.tools || record.fields.Tools || '',
                    author: parsedData.author || record.fields.Author || '',
                    category: categories[0].trim(), // Use first category as primary
                    categories: categories.join(' '), // All categories for filtering
                    link: docLink,
                    tileImage: tileImage,
                    screenshots: images
                });
            }
            
            console.log('Total projects created:', this.projects.length);
            this.renderProjects();
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    parseSummaryTxt(content) {
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
                data.author = body;
            }
        });

        return data;
    }

    getCategories(tools) {
        const categories = [];
        if (!tools) return ['make'];
        
        if (tools.includes('Make.com')) categories.push('make');
        if (tools.includes('Zapier')) categories.push('zapier');
        if (tools.includes('Airtable')) categories.push('airtable');
        if (tools.includes('n8n')) categories.push('n8n');
        
        return categories.length > 0 ? categories : ['make'];
    }

    renderProjects() {
        const swiperWrapper = document.querySelector('.swiper-container-portfolio .swiper-wrapper');
        if (!swiperWrapper) return;

        const slides = this.generateSlides();
        swiperWrapper.innerHTML = slides;
        
        if (window.portfolioSwiper) {
            window.portfolioSwiper.destroy();
        }
        this.initializeSwiper();
        this.attachEventListeners();
    }

    generateSlides() {
        const slides = [];
        
        for (let i = 0; i < this.projects.length; i += this.projectsPerSlide) {
            const slideProjects = this.projects.slice(i, i + this.projectsPerSlide);
            
            while (slideProjects.length < this.projectsPerSlide) {
                slideProjects.push({ isPlaceholder: true });
            }
            
            const slideHTML = `
                <div class="swiper-slide">
                    <div class="projects-grid">
                        ${slideProjects.map(project => this.generateProjectCard(project)).join('')}
                    </div>
                </div>
            `;
            slides.push(slideHTML);
        }
        
        return slides.join('');
    }

    generateProjectCard(project) {
        if (project.isPlaceholder) {
            return `
                <div class="mix make placeholder" style="opacity: 0.3;">
                    <div style="background: #333; height: 200px; display: flex; align-items: center; justify-content: center; color: #666;">
                        <span>More Projects Coming Soon</span>
                    </div>
                    <span class="title">Future Project</span>
                    <span class="port_link">Coming Soon</span>
                </div>
            `;
        }
        
        return `
            <div class="mix ${project.categories || project.category}" data-id="${project.id}" 
                 data-description="${(project.description || '').replace(/"/g, '&quot;')}" 
                 data-tools="${project.tools || ''}" 
                 data-author="${project.author || ''}" 
                 data-link="${project.link}" 
                 data-images='${JSON.stringify(project.screenshots)}'
                 onclick="openProjectModal(this)" style="cursor: pointer;">
                <img src="${project.tileImage}" alt="${project.title}" />
                <span class="title">${project.title}</span>
                <span class="port_link">View Details</span>
            </div>
        `;
    }

    initializeSwiper() {
        window.portfolioSwiper = new Swiper('.swiper-container-portfolio', {
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function() {
                    updatePageInfo(this);
                },
                slideChange: function() {
                    updatePageInfo(this);
                }
            }
        });
    }

    attachEventListeners() {
        // Event listeners now handled by onclick in HTML
    }

    startAutoUpdate() {
        setInterval(() => {
            this.fetchProjects();
        }, 30000);
    }
}

// Global modal function
function openProjectModal(element) {
    const title = element.querySelector('.title').textContent;
    const description = element.getAttribute('data-description');
    const tools = element.getAttribute('data-tools');
    const author = element.getAttribute('data-author');
    const link = element.getAttribute('data-link');
    const images = JSON.parse(element.getAttribute('data-images') || '[]');
    
    // Create modal HTML with Swiper
    const modalHTML = `
        <div id="projectModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 1000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 20px; border-radius: 10px; max-width: 80%; max-height: 80%; overflow-y: auto; position: relative;">
                <button onclick="closeProjectModal()" style="position: absolute; top: 10px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; z-index: 10;">&times;</button>
                <h2>${title}</h2>
                <div style="margin-bottom: 20px;">
                    <div class="swiper-container-modal" style="width: 100%; height: 300px; margin-bottom: 20px;">
                        <div class="swiper-wrapper">
                            ${images.map(img => `<div class="swiper-slide"><img src="${img}" style="width: 100%; height: 100%; object-fit: contain; cursor: pointer;" onclick="window.open('${img}', '_blank')"></div>`).join('')}
                        </div>
                        <div class="swiper-pagination"></div>
                        <div class="swiper-button-next"></div>
                        <div class="swiper-button-prev"></div>
                    </div>
                </div>
                <div style="margin-bottom: 15px;"><strong>Description:</strong><br>${description}</div>
                <div style="margin-bottom: 15px;"><strong>Tools:</strong><br>${tools}</div>
                <div style="margin-bottom: 15px;"><strong>Author:</strong><br>${author}</div>
                ${link && link !== '#' ? `<div><a href="${link}" target="_blank" style="background: #007cba; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Documentation</a></div>` : ''}
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize Swiper for modal images
    setTimeout(() => {
        new Swiper('.swiper-container-modal', {
            slidesPerView: 1,
            spaceBetween: 10,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });
    }, 100);
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.remove();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new AirtablePortfolio();
    portfolio.fetchProjects();
    portfolio.startAutoUpdate();
    
    window.airtablePortfolio = portfolio;
});