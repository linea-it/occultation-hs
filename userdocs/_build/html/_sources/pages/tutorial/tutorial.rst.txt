.. _Sec:tutorial:

Getting Started
================


Install OccultIn
-----------------

The OccultIN Software is available to download via
https://www.11tech.com.br/SORA/Install-Occultin-Windows-0.97.exe for a
Windows operational system and in https://www.11tech.com.br/SORA/install-occultin-linux.sh
for a Linux operational system. Save and execute the installation in your
system. In windows you will have an executable file. In Linux you must
run the shell file.

Supported Operating Systems
~~~~~~~~~~~~~~~~~~~~~~~~~~~

The interface was developed and tested for Windows 10, 11 and Linux operating systems.
In linux, we expect compatibility with most recent versions. It has also been successfully tested in Ubuntu Linux operating systems through wine-7.5 (Staging) if using the windows version.

Known Possible Issues
~~~~~~~~~~~~~~~~~~~~~~~~~~~

In some system configuration scenarios, you may expect some unwanted behaviors, It is important to add that these are not bugs in the software. Additional configurations may be needed for perfect functioning.

Old versions cached data
~~~~~~~~~~~~~~~~~~~~~~~~~~~

If already installed in the machine, the Occultation Interface cached information may interfere with the new version. Configurations may be conserved and some problems arose from that fact. To solve this problem, the interface, when run for the first time, will erase all cached data and end its section for completeness.  After that, everything is expected to work properly.

PATH Environment Variable
~~~~~~~~~~~~~~~~~~~~~~~~~~~
Before starting any project, please make sure that in your environmental variables (Windows or Wine/Linux), a new implicit ‘.’ directory path is added. The absence of it will cause failure in generating the occultation maps images, and ultimately, also failing to complete the task of predicting occultations.
The process behind adding a new folder to your system path will depend on which SO you’re using, but it can easily be found in other sources and tutorials. Just make sure you call it “.” (symbol dot).

Running OccultIn 
-----------------

Once installed we are interested in running the application. This process differs depending on your operational system.

Windows
~~~~~~~~

In windows the process is very forward and it consists of running the ‘AsyncQueueTasks’ file or the icon which is generated for the application.

Linux
~~~~~~~~

In Linux there is a second option in the execution of the interface. One may run it locally or as a server. To do so, respectively, one should run the files “occultin.sh” or “occultin-server.sh”. To run locally, one can also simply use the icon of the application.
