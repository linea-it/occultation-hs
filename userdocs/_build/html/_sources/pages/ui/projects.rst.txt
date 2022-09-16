.. _Sec:projects:

Projects
========

The organization of the data inside the occultation interface is done by means of projects. They are the highest level of data organization and can be accessed only one at a time. Every project has a name and a description and can host one or multiple objects of interest for which occultation predictions will be searched. 

When an occultation prediction is found it means that it is likely for the shadow of the event to be projected onto Earth within the given uncertainties. Errors may occur due to imprecise ephemeris and star position. Further analysis for this event, such as the determination of the real instants of the occultation at a given location and/or fitting the projected shape of the object will need additional observation data. When provided, each occultation prediction entry/result will act as a starting point to add and analyze additional data.


.. image:: ../../images/projects_structure.png
    :width: 600
    :align: center
    :alt: Projects Structure

Projects can be created and removed on the home screen of the application. The creation of a project is linked with the generation of an occultation prediction by design. Once a project is created, it will not be possible to change its attributes. Any updates to a project will require the creation of a new project.
