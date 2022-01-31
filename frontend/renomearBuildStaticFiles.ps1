// RenomearBuildStaticFiles.ps1
move build/static/js build/js 
(Get-Content build/index.html).replace('static/js', 'js') | Set-Content build/index.html

move build/static/css build/css 
(Get-Content build/index.html).replace('static/css', 'css') | Set-Content build/index.html

"Finished Running BuildScript"