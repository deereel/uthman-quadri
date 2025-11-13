const fs = require('fs');
const path = require('path');

const portfoliosDir = 'public/resources/img/portfolios';

function parseSummaryTxt(content) {
    const sections = content.split('\n\n').filter(s => s.trim());
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
    return projects.map(project => `
                        <div class="mix ${project.category}">
                            <img
                                src="${project.tileImage}"
                                alt="" />
                            <span class="title">${project.title}</span>
                            <span class="port_link">View Details</span>
                        </div>`).join('\n');
}

function generatePortfolioJS(projects) {
    const cases = projects.map(project => `
                case '${project.title}':
                  description = '${project.description.replace(/'/g, "\\'")}';
                  tools = '${project.tools}';
                  client = '${project.client}';
                  link = '${project.link}';
                  screenshots = [${project.screenshots.map(s => `'${s}'`).join(', ')}];
                  break;`).join('\n');

    return `
              // Assign sample content based on project title
              switch (title) {${cases}

                default:
                  description = 'Automation workflow connecting multiple apps.';
                  tools = 'Make, Zapier, Airtable';
                  client = 'Various';
                  link = '#';
                  screenshots = ['public/resources/img/portfolios/app/1.jpg'];
              }`;
}

function main() {
    const folders = fs.readdirSync(portfoliosDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    const projects = [];

    folders.forEach(folder => {
        const folderPath = path.join(portfoliosDir, folder);
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
            const docName = `${folder.replace(/ /g, '_')}_Doc.pdf`;
            const docPath = path.join(folderPath, docName);
            if (fs.existsSync(docPath)) {
                link = `public/resources/img/portfolios/${folder}/${docName}`;
            }
        }

        projects.push({
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

    // Read index.html
    let indexContent = fs.readFileSync('index.html', 'utf8');

    // Replace mymixcont content
    const mymixcontRegex = /<div class="mymixcont">[\s\S]*?<\/div>/;
    const newMymixcont = `<div class="mymixcont">
                        ${portfolioHTML}
                    </div>`;
    indexContent = indexContent.replace(mymixcontRegex, newMymixcont);

    // Replace JS switch statement
    const jsRegex = /\/\/ Assign sample content based on project title[\s\S]*?switch \(title\) \{[\s\S]*?default:[\s\S]*?screenshots = \['public\/resources\/img\/portfolios\/app\/1\.jpg'\];\s*\}/;
    indexContent = indexContent.replace(jsRegex, portfolioJS.trim());

    // Write back
    fs.writeFileSync('index.html', indexContent);

    console.log('Portfolio updated successfully!');
}

main();
