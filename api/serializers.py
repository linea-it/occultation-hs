from rest_framework import serializers
from .models import User, Project, Body
from django.core.exceptions import ValidationError
from collections import OrderedDict
import base64
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


class BodySerializer(serializers.ModelSerializer):
     elementContent = serializers.CharField(required=True, allow_blank=True)
     elementType = serializers.ChoiceField(choices=['name', 'file'],required=True)
     class Meta:
        model = Body
        fields = ['bodyName', 'elementContent', 'elementType']
class ProjectSerializer(serializers.ModelSerializer):
    bodys = BodySerializer(many=True, required=False)
    
    referenceCenter = serializers.ChoiceField(choices=['geocenter', 'space craft'],required=True)
    referenceCenterBSPFile = serializers.CharField(required=False, allow_blank=True)
    #bodys = serializers.ListField(
    #    child=serializers.JSONField(required=True)
    #)
    def __init__(self, *args, **kwargs):
        if 'user' in kwargs:
            self.user = kwargs.pop('user')
            print(self.user)
        super(ProjectSerializer, self).__init__(*args,**kwargs)
        
        
    class Meta:
        model = Project
        fields = ('bodys', 'id', 'referenceCenter', 'name', 'initialDateTime', 'finalDateTime', 'limitingMagnitude', 'searchStep',
          'segments','automaticSegments','catalog', 'offEarthSigma', 'radius', 
          'referenceCenterBSPFile', 'description','createdAt')
    
    def validateBody(self, errors, prefix, body):
        if not "bodyName" in body.keys():
            errors["{}.bodyName".format(prefix)] = '{}: bodyName not found! in body element!'.format(prefix)
        if not "elementContent" in body.keys():
            errors["{}.elementContent".format(prefix)] = '{}: elementContent not found! in body element!'.format(prefix)
        if not "elementType" in body.keys():
            errors["{}.elementType".format(prefix)] = '{}: elementType not found! in body element!'.format(prefix)
        elif body["elementType"]!='name' and body["elementType"]!='file':
            errors["{}.elementType".format(prefix)] = '{}: elementType {} is invalid! only accepted values name or file'.format(prefix, body["elementType"])
            
    def validateaaa_(self, data):
        print(data)
        errors = {}
        i=0
        #for body in data["bodys"]:
            #self.validateBody(errors, "bodys[{}]".format(i), body)        
        #    i=i+1
        if not errors:
            return data
        else:
            raise ValidationError(errors)
        
    def create(self, validated_data):
        print(self.user)
        bodys = validated_data['bodys']
        image = validated_data["referenceCenterBSPFile"]
        validated_data.pop('bodys')
        validated_data.pop('referenceCenterBSPFile')
        validated_data["referenceCenterBSPzipFile"] = None if not image else base64.decodebytes(image)

        p = Project.objects.create(user=self.user, **validated_data)
        for obj in bodys:
            body = {
                "bodyName": obj['bodyName'],
                "ephemeris": obj['elementContent'] if obj['elementType'] == 'name' else None,
                "ephemerisBSPzipFile": base64.decodebytes(obj['elementContent']) if obj['elementType'] == 'file' else None,
            }
            Body.objects.create(project=p, **body)
        return p
        

    def update_(self, instance, validated_data):
        instance.email = validated_data.get('email', instance.email)
        instance.content = validated_data.get('content', instance.content)
        instance.created = validated_data.get('created', instance.created)
        instance.save()
        return instance
        
class ValidadeBodySerializer(serializers.Serializer):
    bodyname = serializers.CharField(required=True)
    ephemname = serializers.CharField(required=False)
    ephemcontent = serializers.CharField(required=False)
