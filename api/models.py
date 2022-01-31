from django.db import models
from django.dispatch import receiver
from django.urls import reverse
from django_rest_passwordreset.signals import reset_password_token_created
from django.core.mail import send_mail  
from django.utils.translation import gettext_lazy as _


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    email_plaintext_message = "{}?token={}".format(reverse('password_reset:reset-password-request'), reset_password_token.key)

    send_mail(
        "Password Reset for {title}".format(title="SORA Desktop Version"),
        email_plaintext_message,
        "noreply@somehost.local",
        [reset_password_token.user.email]
    )

class Project(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField("Project name", max_length=255)
    initialDateTime = models.DateTimeField("Initial Period")
    finalDateTime = models.DateTimeField("Initial Period")
    limitingMagnitude = models.DecimalField("Limiting Magnitude",default=18,decimal_places=2, max_digits=10)
    searchStep = models.IntegerField("Search Step",default=7)
    segments = models.IntegerField("Segments",default=8)
    automaticSegments = models.BooleanField("Automatic",default=True)
    catalog = models.CharField("Catalog", max_length=50, default="gaiaedr3")
    offEarthSigma = models.IntegerField("Off Earth Sigma", default=1)
    radius = models.DecimalField("Radius", decimal_places=2, max_digits=10, default=None, null=True)

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
    idProject = models.ForeignKey(Project, on_delete=models.CASCADE)
    class EphemerisType(models.TextChoices):
        JPL_Horizons = 'JPL', _('JPL/Horizons')
        CustomBSP = 'BSP', _('Custom BSP Files')

    ephemeris = models.CharField("Ephemeris", max_length=3, choices=EphemerisType.choices, default=EphemerisType.JPL_Horizons)
    ephemerisBSPzipFile = models.BinaryField(default=None, null=True)
    

class CodeValidation(models.Model):
    email = models.EmailField()
    code = models.IntegerField()
    createdAt = models.DateTimeField("Created At", auto_now_add=True)

    def __str__(self):
        return self.email        