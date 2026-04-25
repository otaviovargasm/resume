function parseBold(text) {
    var parts = text.split(/\*\*(.*?)\*\*/g);
    if (parts.length === 1) return text;
    return parts.map(function(p, i) {
        return i % 2 === 1 ? { text: p, bold: true } : p;
    }).filter(function(p) { return p !== ''; });
}

function parseDetails(text) {
    if (!text) return [];
    var lines = text.trim().split('\n');
    var bullets = [];
    lines.forEach(function(line) {
        line = line.trim();
        if (!line) return;
        var content = line.startsWith('- ') ? line.substring(2) : line;
        bullets.push({ text: parseBold(content), fontSize: 9, color: '#000000', lineHeight: 1.35 });
    });
    if (!bullets.length) return [];
    return [{
        ul: bullets,
        margin: [4, 2, 0, 2],
        fontSize: 9,
        color: '#000000'
    }];
}

// Letter content width: 612 - 54 - 54 = 504pt
var CONTENT_WIDTH = 504;

function sectionHeader(title) {
    return [
        { text: title.toUpperCase(), fontSize: 10, bold: true, color: '#000000', margin: [0, 10, 0, 2] },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.75, lineColor: '#000000' }], margin: [0, 0, 0, 5] }
    ];
}

function generatePDF(filename) {
    var d = window.resumeData;
    var content = [];

    // Name
    content.push({
        text: d.sidebar.name,
        fontSize: 20,
        bold: true,
        color: '#000000',
        alignment: 'center',
        margin: [0, 0, 0, 4]
    });

    // Contact line
    var contactParts = [];
    if (d.sidebar.email)    contactParts.push(d.sidebar.email);
    if (d.sidebar.linkedin) contactParts.push('linkedin.com/in/' + d.sidebar.linkedin);
    if (d.sidebar.github)   contactParts.push('github.com/' + d.sidebar.github);
    if (d.sidebar.timezone) contactParts.push(d.sidebar.timezone);
    content.push({
        text: contactParts.join('  |  '),
        fontSize: 9,
        color: '#000000',
        alignment: 'center',
        margin: [0, 0, 0, 2]
    });

    // Divider below contact
    content.push({ canvas: [{ type: 'line', x1: 0, y1: 0, x2: CONTENT_WIDTH, y2: 0, lineWidth: 0.75, lineColor: '#000000' }], margin: [0, 4, 0, 0] });

    // About / Summary
    content = content.concat(sectionHeader(d['career-profile'].title || 'Summary'));
    content.push({
        text: d['career-profile'].summary.trim(),
        fontSize: 9,
        color: '#000000',
        lineHeight: 1.4,
        margin: [0, 0, 0, 2]
    });

    // Experience
    content = content.concat(sectionHeader(d.experiences.title || 'Experience'));
    d.experiences.info.forEach(function(job) {
        content.push({
            columns: [
                { text: job.role, fontSize: 10, bold: true, color: '#000000', width: '*' },
                { text: job.time, fontSize: 9, color: '#000000', italics: true, alignment: 'right', width: 'auto' }
            ],
            margin: [0, 4, 0, 0]
        });
        content.push({
            columns: [
                { text: job.company, fontSize: 9, color: '#000000', italics: true, width: '*' }
            ],
            margin: [0, 1, 0, 3]
        });
        content = content.concat(parseDetails(job.details));
    });

    // Education
    content = content.concat(sectionHeader(d.education.title || 'Education'));
    d.education.info.forEach(function(edu) {
        content.push({
            columns: [
                { text: edu.degree, fontSize: 10, bold: true, color: '#000000', width: '*' },
                { text: edu.time, fontSize: 9, color: '#000000', italics: true, alignment: 'right', width: 'auto' }
            ],
            margin: [0, 4, 0, 0]
        });
        content.push({ text: edu.university, fontSize: 9, color: '#000000', italics: true, margin: [0, 1, 0, 4] });
    });

    // Projects / Highlights
    content = content.concat(sectionHeader(d.projects.title || 'Highlights & Projects'));
    d.projects.assignments.forEach(function(proj) {
        content.push({ text: proj.title, fontSize: 10, bold: true, color: '#000000', margin: [0, 4, 0, 1] });
        content.push({ text: (proj.tagline || '').trim(), fontSize: 9, color: '#000000', lineHeight: 1.35, margin: [0, 0, 0, 4] });
    });

    // Languages
    if (d.sidebar.languages) {
        content = content.concat(sectionHeader(d.sidebar.languages.title || 'Languages'));
        var langItems = d.sidebar.languages.info.map(function(lang) {
            return lang.idiom + ' — ' + lang.level;
        });
        content.push({ text: langItems.join('     '), fontSize: 9, color: '#000000', margin: [0, 2, 0, 0] });
    }

    var docDefinition = {
        pageSize: 'LETTER',
        pageMargins: [54, 48, 54, 48],
        content: content,
        defaultStyle: { font: 'Roboto', color: '#000000' }
    };

    pdfMake.createPdf(docDefinition).download(filename || 'resume.pdf');
}
