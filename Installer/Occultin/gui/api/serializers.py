import json
from rest_framework import serializers
from .models import Chord, Ellipse, LightCurve, Observer, Prediction, Star, User, Project, Body, Job
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

class PredictionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    body_id = serializers.IntegerField()
    selecionada = serializers.BooleanField()
    content = serializers.CharField(required=False, allow_blank=True)
    graficalContent = serializers.CharField(required=False, allow_blank=True)
    graficalOccultation  = serializers.CharField(required=False, allow_blank=True)
    name = serializers.CharField(required=True, allow_blank=False)
    epoch = serializers.CharField(required=True, allow_blank=False)
    status = serializers.CharField(required=True, allow_blank=False)
    vel = serializers.FloatField(required=True)
    dist = serializers.FloatField(required=True)
    starCode = serializers.CharField(required=False, allow_blank=True)
    ellipseChi2Images = serializers.SerializerMethodField(required=False)
    g = serializers.FloatField()
    class Meta:
        model = Prediction
        fields = ['id', 'body_id', 'selecionada', 'content', 'graficalContent', 'graficalOccultation', 
            'name', 'epoch', 'status', 'vel', 'dist', 'starCode', 'ellipseChi2Images', 'g']
    def get_ellipseChi2Images(self, obj):
        return json.loads(obj.ellipseChi2Imgs) if obj.ellipseChi2Imgs else None

class BodySerializer2(serializers.ModelSerializer):
     id = serializers.IntegerField()
     bodyName = serializers.CharField(required=True, allow_blank=False)
     ephemeris = serializers.CharField(required=True, allow_blank=False)
     ephemerisBSPzipFile = serializers.ChoiceField(choices=['name', 'file'],required=False)
     radius = serializers.DecimalField(default=0, decimal_places=2, max_digits=10)

     class Meta:
        model = Body
        fields = ['id', 'bodyName', 'ephemeris', 'ephemerisBSPzipFile', 'radius']

class BodySerializer(serializers.ModelSerializer):
     elementContent = serializers.CharField(required=True, allow_blank=True)
     elementType = serializers.ChoiceField(choices=['name', 'file'],required=True)
     class Meta:
        model = Body
        fields = ['bodyName', 'elementContent', 'elementType', 'radius']
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
          'segments','automaticSegments','catalog', 'offEarthSigma',
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
                "radius": obj['radius'],
                "ephemeris": obj['elementContent'] if obj['elementType'] == 'name' else None,
                "ephemerisBSPzipFile": obj['elementContent'] if obj['elementType'] == 'file' else None,
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


class JobSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'user' in kwargs:
            self.user = kwargs.pop('user')
            print(self.user)
        super(JobSerializer, self).__init__(*args,**kwargs)
        
    class Meta:
        model = Job
        fields = ('id', 'user', 'project', 'name', 'params', 'result', 'status', 'createdAt',
          'startedAt','endedAt')
    
class LigthCurveSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'user' in kwargs:
            self.user = kwargs.pop('user')
            print(self.user)
        super(LigthCurveSerializer, self).__init__(*args,**kwargs)

    startAcquisition = serializers.SerializerMethodField()
    endAcquisition = serializers.SerializerMethodField()

    def get_startAcquisition(self, lc):
        lc_json = json.loads(lc.json)
        return lc_json['_time'][0]

    def get_endAcquisition(self, lc):
        lc_json = json.loads(lc.json)
        return lc_json['_time'][-1]
        
    class Meta:
        model = LightCurve
        fields = (
            'id',
            'name', 
            'dataFile',
            'timeColumnIndex', 
            'fluxColumnIndex',
            'fluxErrorColumnIndex', 
            'velocity',
            'distance', 
            'diameter', 
            'referenceDate',
            'exposureTime',
            'timeFormat', 
            'prediction_id', 
            'graficalFlux', 
            'graficalModel',
            'graficalModelImmersion',
            'graficalModelEmersion',
            'graficalImmersion', 
            'graficalEmersion',
            'graficalOpacity',
            'initialTime', 
            'endTime',
            'fluxMin',
            'fluxMax',
            'immersionTime',
            'emersionTime',
            'opacity',
            'dopacity',
            'deltaT',
            'sigma',
            'loop',
            'sigmaResult',
            'maxDuration',
            'stepSize',
            'snrLimit',
            'numDetections',
            'negative',
            'startAcquisition',
            'endAcquisition')

class LigthCurveResultsSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'user' in kwargs:
            self.user = kwargs.pop('user')
            print(self.user)
        super(LigthCurveResultsSerializer, self).__init__(*args,**kwargs)
        
    class Meta:
        model = LightCurve
        fields = (
            'id',
            'txtResult',
            'file1Result',
            'file2Result',
            'file3Result',
            'file4Result')


class StarSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        if 'user' in kwargs:
            self.user = kwargs.pop('user')
            print(self.user)
        super(StarSerializer, self).__init__(*args,**kwargs)
        
    class Meta:
        model = Star
        fields = (
            'id', 'code', 'catalog', 'epoch', 'radVel',
            'nomad', 'bjones', 'cgaudin', 'da_cosdec', 
            'ddec', 'varV', 'varB', 'varK', 'varG' ,
            'calculationType', 'starType',
            'diameter', 'prediction_id', 'referenceMag')

class StarDiameterValidator(serializers.Serializer):
    model = Star
    code = serializers.CharField(required=True)
    catalogue = serializers.CharField(required=True)
    epoch = serializers.CharField(required=True)
    radVel = serializers.FloatField(required=False, allow_null=True, default=0)
    da_cosdec = serializers.FloatField(required=False, allow_null=True, default=None)
    ddec = serializers.FloatField(required=False, allow_null=True, default=None)
    nomad = serializers.BooleanField(required=False)
    bjones = serializers.BooleanField(required=False)
    cgaudin = serializers.BooleanField(required=False)
    mode = serializers.CharField(required=True)
    starType = serializers.CharField(required=False, allow_null=True, allow_blank=True, default=None)
    K = serializers.FloatField(required=False)
    V = serializers.FloatField(required=False, allow_null=True)
    B = serializers.FloatField(required=False, allow_null=True)
    G = serializers.FloatField(required=False, allow_null=True)
    band = serializers.CharField(required=False)

    def validate(self, data):
        if (data['mode'] == "kervella" or data['mode'] == "van_belle"):
            if 'K' not in data:
                raise serializers.DjangoValidationError(f"K magnitute is required for {data['mode']} mode")
            if not data.get('G'):
                raise serializers.DjangoValidationError(f"G magnitute is required for {data['mode']} mode")
            if not data.get('V') and not data.get('B'):
                raise serializers.DjangoValidationError(f"V or B magnitudes must be provided for {data['mode']} mode")
            if data["mode"] == 'van_belle' and not data.get('starType', None):
                raise serializers.DjangoValidationError(f"Star type is required for {data['mode']} mode")
        return data

class ObserverValidator(serializers.Serializer):
    model = Observer
    id = serializers.IntegerField(required=False, allow_null=True)
    predictionId = serializers.IntegerField(required=False, allow_null=True)
    name = serializers.CharField(required=True)
    latitude = serializers.CharField(required=True)
    longitude = serializers.CharField(required=True)
    altitude = serializers.FloatField(required=True)

    def validate(self, data):
        if ('id' not in data and 'predictionId' not in data):
            raise serializers.DjangoValidationError('id or predictionId must be provided.')
        return data

class ObserverSerializer(serializers.ModelSerializer):        
    class Meta:
        model = Observer
        fields = ('id', 'prediction_id', 'name', 'latitude', 'longitude', 'altitude')

class ChordSerializer(serializers.ModelSerializer):    
    lightCurve_name = serializers.CharField(source='lightCurve.name')
    observer_name = serializers.CharField(source='observer.name')
    negative = serializers.BooleanField(source='lightCurve.negative')
    class Meta:
        model = Chord
        fields = ('id', 'prediction_id', 'lightCurve_id', 'observer_id', 'name', 'color', 'lightCurve_name', 'observer_name', 'timeShift', 'negative')

class ChordValidator(serializers.Serializer):
    model = Chord
    id = serializers.IntegerField(required=False, allow_null=True)
    predictionId = serializers.IntegerField(required=False, allow_null=True)
    lightCurveId = serializers.IntegerField(required=True)
    observerId = serializers.IntegerField(required=True)
    name = serializers.CharField(required=True)
    color = serializers.CharField(required=False)
    timeShift = serializers.FloatField(required=False, allow_null=True, default=None)

    def validate(self, data):
        if ('id' not in data and 'predictionId' not in data):
            raise serializers.DjangoValidationError('id or predictionId must be provided.')
        return data

class EllipseValidator(serializers.Serializer):
    centerF = serializers.FloatField(required=True)
    centerG = serializers.FloatField(required=True)
    equatorialRadius = serializers.FloatField(required=True)
    oblateness = serializers.FloatField(required=True)
    positionAngle = serializers.FloatField(required=True)
    dCenterF = serializers.FloatField(required=False, allow_null=True)
    dCenterG = serializers.FloatField(required=False, allow_null=True)
    dEquatorialRadius = serializers.FloatField(required=False, allow_null=True)
    dOblateness = serializers.FloatField(required=False, allow_null=True)
    dPositionAngle = serializers.FloatField(required=False, allow_null=True)
    loop = serializers.IntegerField(required=False, allow_null=True)
    dChiMin = serializers.FloatField(required=False, allow_null=True)
    numberChi = serializers.IntegerField(required=False, allow_null=True)
    ellipseError = serializers.FloatField(required=False, allow_null=True)
    sigmaResult = serializers.FloatField(required=False, allow_null=True)
    allEllipses = serializers.BooleanField(required=False, allow_null=True)

class EllipseSerializer(serializers.ModelSerializer):   
    class Meta:
        model = Ellipse
        fields =    ('centerF', 'centerG', 'equatorialRadius', 'oblateness', 'positionAngle',
                     'dCenterF', 'dCenterG', 'dEquatorialRadius', 'dOblateness', 'dPositionAngle',
                     'loop', 'dChiMin', 'numberChi', 'ellipseError', 'sigmaResult', 'allEllipses',
                     'negativeChord', 'step', 'sigma', 'minX', 'maxX', 'minY', 'maxY', 'legendLocation')

class FilterNegativeValidator(serializers.Serializer):
    negativeChord = serializers.CharField(required=True)
    step = serializers.FloatField(required=True)
    sigma = serializers.FloatField(required=False, allow_null=True)
    class Meta:
        model = Ellipse
        fields = ('negativeChordName', 'step' 'sigma')