.. _Sec:predictions:

Occultation Predictions
------------------------

In this section we will describe how to use the Occultation Prediction Interface. This UI section is divided into 5 sequential screens: Project Name, Solar System Object, Time Range, Extra Information, and Summary.

Project Name
^^^^^^^^^^^^^^^^^^

The first step when initializing a new project consists of naming and describing it. Naming the project is required, whilst adding a description is optional. The name field is the project’s identifier. Therefore it must be unique. Add a description to describe the project further if needed.

Solar System Object
^^^^^^^^^^^^^^^^^^^^

One or multiple objects can be added as targets for occultation predictions in each project.  The field “Object Name” needs to receive a valid identifier, for their database - the official name of the body, the spkid, or the designated number for the query are all options to be provided and can all be found on the `Small Bodies Database <https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/>`_ from the Jet Propulsion Lab (JPL). Once you provide a valid object's identifier you can choose the source to retrieve the target's ephemeris: online or local. If you choose the online method, a query is submitted to the JPL Small-Body Database.

For the body ephemeris, it is suggested to use the 'Horizons/JPL' query, as it is the default in the application. It may be necessary to use BSP files if the object is not included in the database. Again, be aware of the format used and that this is more challenging if you have no experience with BSP files or the application.

Although it is possible to add and work with multiple bodies, creating a project for each object of interest for this interface version is recommended, as the configurations for the search you'll add further on will count for all bodies included. Those, of course, can demand distinct configurations given, for example, the density of stars in the body field.

Time Range
^^^^^^^^^^^^^^^^^^^^

The next step is adding a time interval to the prediction, with start and end times. The time inserted, if written manually, should have the format “yyyy-mm-dd” for the date and “hour: minute” for the hour. Note that the format considers times from 00:00 to 23:59, not AM and PM. There is also a display calendar to pick dates from.

Beyond that, this page also requires mandatory Prediction Parameters. The “Star Magnitude Limit” asks for the maximum star magnitude to look up for prediction (default is 10). The “Search Step” is the step in seconds to calculate the predictions (default is 60) and the “Segment (divs)” is the number of divisions on the stellar catalog to perform the search (default is 1). Increasing this number is advised if large amounts of data are expected to be retrieved.

Extra Information
^^^^^^^^^^^^^^^^^^^^

Extra information is dealt with in two fields, “Catalog” (default is “gaiardr3”) and “Off-Earth Sigma” (default is 1). 

The catalog where the interface will search for the stars can be changed to “gaiadr2”, but for the general application, it is sufficient to keep the default.

The "Off-Earth Sigma" means that occultations with an off-Earth ephemeris error sigma equal to the input number are considered. Increasing this number will cause occultations with larger off-Earth sigma errors to be found and counted as results.

Summary
^^^^^^^^^^^^^^^^^^^^

This step summarizes all the information to be checked before creating the project. It is impossible to edit the data afterward without creating a new project. No additional action is required on this page.

Managing and Exploring occultations
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

It is necessary to note that it may take a while for the predictions to be ready as searches may vary in time consumed. “Jobs'' opens a modal where processes executed, canceled and in execution are listed. At first, only the prediction will be in the listing.

If the job is still being executed, you will view its status as “running”. If everything runs smoothly, the status will be “finished”; if it doesn't, it'll be an “error”. For the latter, there is a “try again” option. It is not unusual for the catalog provider to restrain access when many searches are performed so the error may be due to that restriction.

If the prediction succeeds, all the found occultations will appear in the tree on the left of the application. All occultations are inside the body branch. There are also managing options and a listing of events inside the body page.

Clicking on an occultation event will open a page with access to the management of 'Light Curves', 'Star' and 'Chords'. Notice that the event name can be changed.
