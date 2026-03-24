const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'pages', 'student');

try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));
    let changedFiles = 0;

    for (const file of files) {
        const filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        if (content.includes('../components/')) {
            content = content.replace(/from ['"]\.\.\/components\//g, "from '../../components/");
            fs.writeFileSync(filepath, content);
            changedFiles++;
            console.log(`Updated ${file}`);
        }
    }

    console.log(`Successfully updated ${changedFiles} files in pages/student.`);
} catch (error) {
    console.error("Error during replacement:", error);
}
