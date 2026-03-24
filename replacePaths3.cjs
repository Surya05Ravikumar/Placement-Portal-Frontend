const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'components', 'student');

try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
    let changedFiles = 0;

    for (const file of files) {
        const filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        // Replace ./common/ with ../common/
        if (content.includes('./common/')) {
            content = content.replace(/from ['"]\.\/common\//g, "from '../common/");
            fs.writeFileSync(filepath, content);
            changedFiles++;
            console.log(`Updated component paths in ${file}`);
        }
    }

    console.log(`Successfully updated ${changedFiles} files with common component paths.`);
} catch (error) {
    console.error("Error during replacement:", error);
}
