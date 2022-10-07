.. _Sec:shape_analysis:

Ellipse Fit determination
==========================


Overview
---------
Fitting an ellipse is an important step in investigating the shape of the observed body. The fit is based on the chords projected in the sky plane. Using its limits, that is, the extremes of the body extension, it runs the search for the best parameters of the ellipse. All chords added are used and using few results in a family of ellipses that fit well the data. Chords can be labeled negative and be used as boundaries for solutions.

The steps then pass through adding the observers/sites, adding chords, and then fitting ellipses to the data considered.


Adding Sites/Observers
----------------------
Sites and Observers are needed as any light curve is associated with an observation with its characteristics. Latitudes and Longitudes that are inputted as ∓12 34 56.78 and are geocentric. We consider the North and East positives. Altitudes are given in meters as usual.


Linking chords and sites
------------------------
To add a chord it is necessary to associate a light curve with an observer. This defines the geometry of the observation and how and where to plot the line. The color associated with each chord can be defined from a hue.

Ellipse parameters setting
---------------------------
To start the search for the parameters, an initial ‘guess’, in addition to an error estimate, is needed. Based on that, and using SORA, the application will run for multiple combinations of parameters within the error given. Arriving in what is supposed to be the best fit for the range. Shadow of alternative solutions within a range of sigma can also be plotted and helps to visualize the fit.

A comment is necessary on the quality of the guesses. If too imprecise convergence may be hard in the current version of SORA (next versions are expected to fix this problem) and can break the application. If this happens, and it is recognizable by the ellipse fit stuck in zero percent, one should cancel the process and restart the application.

Filter
-------
As we can have negative chords, we should also be able to filter solutions for those chords. As we said, negative chords are used as boundary conditions for the solutions. The first step is identifying a negative register of the event and setting the light curve as such. Next we do the ellipse fit. Finally with the solutions in hand and the negative chord available we can filter solutions.

Outputs (plots)
------------------------
We have our main plot with the chords and, after the fit, the family of ellipses solutions to the fit. Besides this, many chi-square plots to evaluate each ellipse parameter's quality of fit are also available.

Saving the modeled data
------------------------
The results modeled can be exported on ‘Results’.
