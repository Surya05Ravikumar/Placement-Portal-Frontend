const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'student');

try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
    let changedFiles = 0;

    for (const file of files) {
        const filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        // Look for imports from '../../components/' that don't go into 'common/' or 'admin/'
        // and replace them with '../../components/student/'
        const regex = /from ['"]\.\.\/\.\.\/components\/([^'"]+)['"]/g;

        let modified = false;
        content = content.replace(regex, (match, p1) => {
            if (!p1.startsWith('common/') && !p1.startsWith('admin/') && !p1.startsWith('student/')) {
                modified = true;
                return `from '../../components/student/${p1}'`;
            }
            return match;
        });

        if (modified) {
            fs.writeFileSync(filepath, content);
            changedFiles++;
            console.log(`Updated component paths in ${file}`);
        }
    }

    console.log(`Successfully updated ${changedFiles} files with student component paths.`);
} catch (error) {
    console.error("Error during replacement:", error);
}
