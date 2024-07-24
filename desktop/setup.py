from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need
# fine tuning.
build_options = {'packages': ['django'], # ,'cartopy'], 
                 'includes': ['six', 'PyQt5', 'corsheaders' ,
											'rest_framework', 'rest_framework_simplejwt',
											'django_rest_passwordreset'],
                 'excludes': [],
                 'silent': ['-s']}

base = 'Console'

executables = [
    Executable('soragui.py', base=base, target_name = 'Sora-GUI')
]

setup(name='Sora-GUI',
      version = '1.0',
      description = '',
      options = {'build_exe': build_options},
      executables = executables)
