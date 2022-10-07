.. _Sec:light_curve_analysis:

Light Curve Analysis
====================

Customizing the Star information
---------------------------------
Inside the occultation event tab, there is a ‘Star’ button to customize the Star object information. In the modal relative to its addition, notice that many fields are already filled out. This is because there is already information on which stellar body is associated with the event, although some information might still be needed to set the object. Its Apparent Diameter can and must, be calculated to proceed with the analysis. 

Bayley-Jones Star distance and Proper Motion Correction are usually suggested to be checked for most applications. For the apparent diameter, four methods are offered: Kervella, Van Belle, Catalog, and Manual. Although their description is beyond our scope, much of the info needed to use them is automatically filled.


Adding Light Curves
--------------------
The option “New Light Curve”, inside the event will open a modal window. Notice when uploading a file related to a light flux that its column indexes must be specified in the correspondent fields (indexing starts at 1). There is an option to specify if a flux error exists in the file and its column index.

Normalizing the data
---------------------
It is usual to normalize data as many factors disturb the, in most cases, expected ‘linearity’ of the curve. To reinstate that, we can normalize it with polynomials. It is common to use orders up to at most 5 or 6, but most applications use 1-3 degree polynomials. 

The mask is a critical aspect of the normalization process. Is a must to specify the beginning and end of the occultation event in the curve, as this part should not be distorted in the process, nor count for the deviation in the normalization.

The flux scale may also be used to specify ranges for the flux on the y-axis.


Autodetect
-----------
It is needed to detect the occurrence of occultation events in our data. Those can be of the main body occultation or the many, in the case of multiple body systems. Can also be of secondary occultations of multiple origins such as moons or rings. If there is suspicion that more than one occultation may have occurred, the ‘Number of occultations’ field, in the advanced settings, can specify the desired number of occultations to be found.

Max duration is the time span of the light curve. Step size has a default at half of the sampling rate of the data. Shorter steps don’t have an advantage over the default. Defining the SNR (signal to noise ratio) prevents finding any ‘event’ with less significance.

The process of detection is described in SORA and won’t be discussed.


Fitting the Model
------------------
Fitting the models allows a decomposition of the data in the many predicted curves it should be composed of. It is done according to the SORA functions of fitting using the Monte Carlo chi-square fit. Plots are automatically generated.


Outputs (plots)
----------------
All plots generated in the process are added to your light curve tab.


Saving the modeled data
------------------------
All modeled data and results can be exported with the ‘Results’ button. There the platform describes all results generated from the light curve.