from gettext import Catalog
import uuid
from xml.etree.ElementInclude import default_loader
from django.db import models
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail  
from django.utils.translation import gettext_lazy as _
from django.contrib.auth.models import AbstractUser,PermissionsMixin
from .managers import UserManager

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    user = User.objects.filter(email=reset_password_token.user.email)[0]
    email_plaintext_message = "Dear {},\n\n\tYour code validation is {}\n\natt,\n\tSora Support\n".format(user.username, reset_password_token.key)
    send_mail(
        "Password Reset for {title}".format(title="SORA Desktop Version"),
        email_plaintext_message,
        "sora.gui2022@gmail.com",
        [reset_password_token.user.email]
    )



class User(AbstractUser, PermissionsMixin):
    email = models.EmailField(verbose_name="email", max_length=60, unique=True, blank=True, null=True, default=None)
    username= models.CharField(max_length=30,unique=True, blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    EMAIL_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'password']
    
    objects = UserManager()
    
    def __str__(self):
        return str(self.email)
    
    def get_full_name(self): return self.username


class Project(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField("Project name", max_length=255)
    initialDateTime = models.DateTimeField("Initial Period")
    finalDateTime = models.DateTimeField("Final Period")
    limitingMagnitude = models.DecimalField("Limiting Magnitude",default=18,decimal_places=2, max_digits=10)
    searchStep = models.IntegerField("Search Step",default=7)
    segments = models.IntegerField("Segments",default=8)
    automaticSegments = models.BooleanField("Automatic",default=True)
    catalog = models.CharField("Catalog", max_length=50, default="gaiaedr3")
    offEarthSigma = models.IntegerField("Off Earth Sigma", default=1)

    class ReferenceCenterType(models.TextChoices):
        GEOCENTER = 'GC', _('Geocenter')
        SPACE_CRAFT = 'SC', _('Space Craft')

    referenceCenter = models.CharField("Reference Center", max_length=2, choices=ReferenceCenterType.choices, default=ReferenceCenterType.GEOCENTER)
    referenceCenterBSPzipFile = models.BinaryField(default=None, null=True)

    description = models.TextField(blank=True, null=True)
    createdAt = models.DateTimeField("Created At", auto_now_add=True)

    def __str__(self):
        return self.name

class Body(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    bodyName = models.CharField("Body Name", max_length=50)
    class EphemerisType(models.TextChoices):
        JPL_Horizons = 'JPL', _('JPL/Horizons')
        CustomBSP = 'BSP', _('Custom BSP Files')

    ephemeris = models.CharField("Ephemeris", max_length=3, choices=EphemerisType.choices, default=EphemerisType.JPL_Horizons, null=True)
    ephemerisBSPzipFile = models.TextField(default=None, null=True)
    radius = models.FloatField("Radius", null=True)
    

class CodeValidation(models.Model):
    email = models.EmailField()
    code = models.IntegerField()
    createdAt = models.DateTimeField("Created At", auto_now_add=True)

    def __str__(self):
        return self.email        
    
    
class Job(models.Model):
    id = models.AutoField(primary_key=True)
    modelId = models.IntegerField('Model Id')
    guidTask = models.UUIDField('Guid Task', default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    name = models.CharField("Job name", max_length=255)
    params = models.JSONField("Params",null=True)
    result = models.JSONField("Result",null=True)
    createdAt = models.DateTimeField("Created At", auto_now_add=True)
    startedAt = models.DateTimeField("Started At",null=True)
    endedAt = models.DateTimeField("Ended At",null=True)

    class StatusType(models.TextChoices):
        Waiting = 'waiting', _('Waiting')
        Running = 'running', _('Running')
        Success = 'success', _('Success')
        Error = 'error', _('Error')
        Canceled = 'canceled', _('Canceled')

    status = models.CharField("Status", max_length=8, choices=StatusType.choices, default=StatusType.Waiting)

class Prediction(models.Model):
    id: models.AutoField(primary_key=True)
    body = models.ForeignKey(Body, on_delete=models.CASCADE)
    selecionada = models.BooleanField("Selecionada",default=True)
    content = models.TextField("Content")
    graficalContent = models.TextField("GraficalContent", default=None, null=True)
    graficalOccultation = models.TextField("Grafical", default=None, null=True)
    name = models.CharField("Name", max_length=255, default=None)
    epoch = models.CharField("Epoch", max_length=255, default=None)
    vel = models.FloatField("Velocidade", default=0, null=False)
    dist = models.FloatField("Distancia", default=0, null=False)
    starCode = models.CharField("StarCode", max_length=255, default=None, null=True)
    ellipseChi2 = models.TextField("Ellipse Chi2", default=None, null=True)
    ellipseChi2Imgs = models.TextField("Ellipse Chi2 Images", default=None, null=True)
    fittedOcc = models.TextField("Fitted Occultation", default=None, null=True)
    g = models.FloatField("Magnitude G", default=None, null=True)
    class StatusType(models.TextChoices):
        Waiting = 'waiting', _('Waiting')
        Running = 'running', _('Running')
        Success = 'success', _('Success')
        Error = 'error', _('Error')

    status = models.CharField("Status", max_length=7, choices=StatusType.choices, default=StatusType.Waiting)

class LightCurve(models.Model):
    id: models.AutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    name = models.CharField("Name", max_length=255, default=None, null=True) 
    dataFile = models.TextField("DataFile")
    timeColumnIndex = models.IntegerField("TimeColumnIndex")
    fluxColumnIndex = models.IntegerField("FluxColumnIndex")
    fluxErrorColumnIndex = models.IntegerField("FluxErrorColumnIndex")
    velocity = models.FloatField("Velocity")
    distance = models.FloatField("Distance")
    diameter = models.FloatField("Diameter")
    exposureTime = models.FloatField("ExposureTime", null=True)
    referenceDate = models.DateTimeField("ReferenceDate", null=True)
    graficalModel = models.TextField("GraficalModel", default=None, null=True)
    graficalModelImmersion = models.TextField("GraficalModelImmersion", default=None, null=True)
    graficalModelEmersion = models.TextField("GraficalModelEmersion", default=None, null=True)
    graficalImmersion = models.TextField("GraficalImmersion", default=None, null=True)
    graficalEmersion = models.TextField("GraficalEmersion", default=None, null=True)
    graficalOpacity = models.TextField("GraficalOpacity", default=None, null=True)
    graficalFlux = models.TextField("GraficalFlux", default=None, null=True)
    class TimeFormat(models.TextChoices):
        Julian = 'Julian', _('Julian')
        Seconds = 'Seconds', _('Seconds')
    timeFormat = models.CharField("TimeFormat", max_length=7, choices=TimeFormat.choices, default=TimeFormat.Julian)
    maxDuration = models.FloatField("MaximumDuration", default=None, null=True)
    stepSize = models.FloatField("StepSize", default=None, null=True)
    snrLimit = models.FloatField("SNRLimit", default=None, null=True)
    numDetections = models.FloatField("NumberDetection", default=None, null=True)
    initialTime = models.FloatField("InitialTime", null=True)
    endTime = models.FloatField("EndTime", null=True)
    fluxMin = models.FloatField("FluxMin", null=True)
    fluxMax = models.FloatField("FluxMax", null=True)
    immersionTime = models.FloatField("ImmersionTime", null=True)
    emersionTime = models.FloatField("EmersionTime", null=True)
    opacity = models.FloatField("Opacity", null=True)
    dopacity = models.FloatField("Dopacity", null=True)
    deltaT = models.FloatField("DeltaT", null=True)
    sigma = models.TextField("Sigma", null=True)
    loop = models.IntegerField("Loop", null=True)
    sigmaResult = models.FloatField("SigmaResult", null=True)
    json = models.TextField("Json", default=None, null=True)
    txtResult = models.TextField("txtResult", default=None, null=True)
    file1Result = models.TextField("file1Result", default=None, null=True)
    file2Result = models.TextField("file2Result", default=None, null=True)
    file3Result = models.TextField("file3Result", default=None, null=True)
    file4Result = models.TextField("file4Result", default=None, null=True)
    negative = models.BooleanField('Negative', default=False)

class Star(models.Model):
    id: models.AutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    code = models.CharField("Code", max_length=255, null=False)
    catalog = models.CharField("Catalog", max_length=50)
    epoch = models.CharField("Epoch", max_length=10, default="J2000")
    radVel = models.FloatField("radVel", default=0, null=True)
    nomad = models.BooleanField("Nomad", default=False)
    bjones = models.BooleanField("Bjones", default=False)
    cgaudin = models.BooleanField("Cgaudin", default=False)
    da_cosdec = models.FloatField("da_cosdec", default=0, null=True)
    ddec = models.FloatField("ddec", default=0, null=True)
    varV = models.FloatField("varV", default=0, null=True)
    varB = models.FloatField("varB", default=0, null=True)
    varK = models.FloatField("varK", default=0, null=True)
    varG = models.FloatField("varG", default=0, null=True)
    diameter = models.FloatField("Diameter", default=0, null=True)
    referenceMag = models.CharField("referenceMag", max_length=1, default="")
    class CalculationType(models.TextChoices):
        Kervella = 'kervella', _('kervella')
        Vanbelle = 'van_belle', _('van_belle')
        Catalog = 'gaia', _('gaia')
        Manual = 'user', _('user')
    
    calculationType =  models.CharField("CalculationType", max_length=9, choices=CalculationType.choices, default=None, null=True)
    
    class StarType(models.TextChoices):
        Sg = 'sg', _('sg')
        Ms = 'ms', _('ms')
        Vs = 'vs', _('vs')
    
    starType =  models.CharField("StarType", max_length=2, choices=StarType.choices, default=None, null=True)

class Observer(models.Model):
    id: models.AutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    name = models.CharField("Name", max_length=50)
    latitude = models.CharField("Latitude", max_length=50)
    longitude = models.CharField("Longitude", max_length=50)
    altitude = models.FloatField("Altitude")

class Chord(models.Model):
    id: models.AutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    lightCurve = models.ForeignKey(LightCurve, on_delete=models.CASCADE)
    observer = models.ForeignKey(Observer, on_delete=models.CASCADE)
    name = models.CharField("Name", max_length=50)
    color = models.CharField("Color", max_length=7)
    timeShift = models.FloatField("Time Shift", null=True)

class Ellipse(models.Model):
    id: models.AutoField(primary_key=True)
    prediction = models.ForeignKey(Prediction, on_delete=models.CASCADE)
    centerF = models.FloatField("centerF", null=True)
    centerG = models.FloatField("centerG", null=True)
    equatorialRadius = models.FloatField("equatorialRadius", null=True)
    oblateness = models.FloatField("oblateness", null=True)
    positionAngle = models.FloatField("positionAngle", null=True)
    dCenterF = models.FloatField("dCenterF", null=True)
    dCenterG = models.FloatField("dCenterG", null=True)
    dEquatorialRadius = models.FloatField("dEquatorialRadius", null=True)
    dOblateness = models.FloatField("dOblateness", null=True)
    dPositionAngle = models.FloatField("dPositionAngle", null=True)
    loop = models.IntegerField("loop", null=True)
    dChiMin = models.FloatField("dChiMin", null=True)
    numberChi = models.IntegerField("numberChi", null=True)
    ellipseError = models.FloatField("ellipseError", null=True)
    sigmaResult = models.FloatField("sigmaResult", null=True)
    allEllipses = models.BooleanField("allEllipses", null=True)
    negativeChord = models.CharField("Negative Chord", null=True, max_length=50)
    step = models.FloatField("Step", null=True, max_length=8)
    sigma = models.FloatField("Sigma", null=True)
    minX = models.FloatField("Min X", null=True)
    maxX = models.FloatField("Max X", null=True)
    minY = models.FloatField("Min Y", null=True)
    maxY = models.FloatField("Max Y", null=True)
    legendLocation = models.CharField("Legend Location", null=True, max_length=20)
