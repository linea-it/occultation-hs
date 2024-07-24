const fs = require('fs-extra');
const path = require('path')

function textFile(nomeArq)
{
    ext = path.extname(nomeArq).toLowerCase();
    
    return ['.js','.css','.map','json','.html'].includes(ext);
}

function getAllfiles(dir) {
    
    const fs = require('fs');
    const files = fs.readdirSync(dir, { withFileTypes: true });
    const resp=[]
    for (const file of files) 
        if (file.name!='.' && file.name!='..' && textFile(file.name)) {
            console.log(file);
            if (file.isDirectory())
                for(const x of getAllfiles(path.join(dir, file.name)))
                    resp.push(x);
            else
                resp.push(path.join(dir, file.name));
        }
    return resp;
  }

try {  
    for(const nomeArq of getAllfiles('build'))
    {
        var data = fs.readFileSync(nomeArq, 'utf8');
        data =data.replace(/static\//g,'res/');
        fs.writeFileSync(nomeArq,data, 'utf8');
    }
    fs.renameSync('build/static', 'build/res');

    fs.rmSync('../pages', { recursive: true, force: true });

    fs.renameSync('build','pages');
    fs.moveSync('pages','../pages');
    console.log('success!');
} catch(e) {
    console.log('Error:', e.stack);
}