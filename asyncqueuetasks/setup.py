from cx_Freeze import setup, Executable

# Dependencies are automatically detected, but it might need
# fine tuning.
build_options = {'packages': ['sora', 
                              'astropy', 
                              'astroquery', 
                              'matplotlib', 
                              'numpy', 
                              'scipy', 
                              'spiceypy',
                              'cartopy'], 
                 'includes': ['six','numpy'],
                 'excludes': ['tkinter','tcl'],
		 'build_exe': 'dist',
                 'silent': ['-s']}

base = 'Console'

executables = [
    Executable('asyncqueuetasks.py', base=base, target_name = 'AsyncQueueTasks', icon="icone.ico")
]

setup(name='AsyncQueueTasks',
      version = '1.0',
      description = '',
      options = build_options,
      executables = executables)
