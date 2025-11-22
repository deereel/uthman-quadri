class AirtablePortfolio {
    constructor() {
        this.apiKey = 'patU6popFbTUeRffY.5be688e9a4cdff9af1ff208cecafa3479f485d24e6971fa2b1dd6a970b31f192';
        this.baseId = 'Yappq3cC3epOtK5jc3';
        this.tableName = 'Projects';
        this.projects = [];
        this.projectsPerSlide = 9;
    }

    async fetchProjects() {
        try {
            const response = await fetch(`https://api.airtable.com/v0/${this.baseId}/${this.tableName}?filterByFormula=AND({Status}='Completed',{Images}!=BLANK())`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            });
            
            const data = await response.json();
            this.projects = [];
            
            for (const record of data.records) {
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
                const tileImage = images.find(img => {
                    const filename = img.split('/').pop().split('?')[0];
                    return filename.startsWith('0.');
                }) || images[0] || '';
                
                // Create project for each category
                categories.forEach(category => {
                    this.projects.push({
                        id: record.fields.Title.toLowerCase().replace(/\s+/g, '-'),
                        title: record.fields.Title,
                        description: parsedData.description || record.fields.Description || '',
                        tools: parsedData.tools || record.fields.Tools || '',
                        author: parsedData.author || record.fields.Author || '',
                        category: category.trim(),
                        link: docLink,
                        tileImage: tileImage,
                        screenshots: images
                    });
                });
            }
            
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
            <div class="mix ${project.category}" data-id="${project.id}" 
                 data-description="${(project.description || '').replace(/"/g, '&quot;')}" 
                 data-tools="${project.tools || ''}" 
                 data-author="${project.author || ''}" 
                 data-link="${project.link}" 
                 data-images='${JSON.stringify(project.screenshots)}'>
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
        document.querySelectorAll('.projects-grid .mix:not(.placeholder)').forEach(card => {
            card.addEventListener('click', () => showProjectModal(card));
        });
    }

    startAutoUpdate() {
        setInterval(() => {
            this.fetchProjects();
        }, 30000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const portfolio = new AirtablePortfolio();
    portfolio.fetchProjects();
    portfolio.startAutoUpdate();
    
    window.airtablePortfolio = portfolio;
});