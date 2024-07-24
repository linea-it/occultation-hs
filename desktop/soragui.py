import os

if __name__ == '__main__':
    fileName = 'startsora.py' 
    if os.path.isfile(fileName):
        exec(open(fileName,'rb').read())
