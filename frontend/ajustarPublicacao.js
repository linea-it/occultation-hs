const fs = require('fs-extra');

try {  
    var data = fs.readFileSync('build/index.html', 'utf8');
    data =data.replace(/static/g,'res');
    fs.writeFileSync('build/index.html',data, 'utf8');
    fs.renameSync('build/static', 'build/res');

    fs.rmSync('../pages', { recursive: true, force: true });
   
    fs.renameSync('build','pages');
    fs.moveSync('pages','../pages');
    console.log('success!');
} catch(e) {
    console.log('Error:', e.stack);
}