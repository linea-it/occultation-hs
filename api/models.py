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
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    bodyName = models.CharField("Body Name", max_length=50)
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