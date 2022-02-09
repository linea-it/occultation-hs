from django.contrib.auth.models import User, Group
from rest_framework import serializers
from . import models

class UserListSerializer(serializers.Serializer):
    model = User
    id = serializers.IntegerField(source='pk', required=True)
    email = serializers.CharField(required=True)
    username = serializers.CharField(required=True)

class UserCreateSerializer(serializers.Serializer):
    model = User
    email = serializers.CharField(required=True)
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)

class UserUpdateSerializer(serializers.Serializer):
    model = User
    email = serializers.CharField(required=True)
    username = serializers.CharField(required=True)

class UserChangePasswordSerializer(serializers.Serializer):
    model = User

    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Project
        fields = ('id','name', 'initialDateTime', 'finalDateTime', 'searchStep',
          'segments','automaticSegments','offEarthSigma', 'radius', 'referenceCenter', 
          'description','createdAt')
       
class ValidadeBodySerializer(serializers.Serializer):
    bodyname = serializers.CharField(required=True)
    ephemname = serializers.CharField(required=False)
    ephemcontent = serializers.CharField(required=False)
