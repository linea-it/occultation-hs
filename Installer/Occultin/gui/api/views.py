import datetime
from django.utils import timezone
from django.core.mail import send_mail
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny   
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import *
from .serializers import *
from .taskproducer import *
from rest_framework_simplejwt.tokens import RefreshToken
from .utils import generate_token


class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = UserChangePasswordSerializer
    model = User
    permission_classes = (IsAuthenticated,)

    def get_object(self, queryset=None):
        obj = self.request.user
        return obj

    def update(self, request, *args, **kwargs):
        currentUser = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Check old password
            if not currentUser.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            if serializer.data.get('password') != serializer.data.get('confirm_password'):
                return Response({"confirm password": ["password and confirm password must match."]}, status=status.HTTP_400_BAD_REQUEST)
            # set_password also hashes the password that the user will get
            currentUser.set_password(serializer.data.get("new_password"))
            currentUser.save()
            response = {
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'Password updated successfully',
                'data': []
            }

            return Response(response)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def send_activation_email(user):
    token = generate_token.make_token(user)
    email_plaintext_message = "Dear {},\n\n\tYour code validation is {}\n\natt,\n\tSora Support\n".format(user.username, token)
    send_mail(
        "Email Activation for {title}".format(title="SORA Desktop Version"),
        email_plaintext_message,
        "sora.gui2022@gmail.com",
        [user.email]
    )

def createDbPrediction(job):
    ocultations = json.loads(job.result)
    body = Body.objects.get(id=job.modelId)
    for oc in ocultations:
        pred = Prediction()
        pred.body = body
        pred.starCode = oc.get("id")# 'Gaia-EDR3 Source ID'
        pred.name = oc.get("epoch")
        pred.epoch = oc.get("epoch")
        pred.vel = oc.get("vel")
        pred.dist = oc.get("dist")
        pred.content = oc.get("content")
        pred.graficalContent = oc.get("image")
        pred.g = oc.get("G")
        pred.save()

def plot_light_curve(lc, task, operations):
    tref = None
    if lc.referenceDate:
        tref = lc.referenceDate.isoformat()[:-6]
    return task.light_curve_plot(lc.id, lc.name, lc.exposureTime, 
        {"file": lc.dataFile, "time":lc.timeColumnIndex, "flux":lc.fluxColumnIndex,"error":lc.fluxErrorColumnIndex if lc.fluxErrorColumnIndex >= 0 else None}, 
        {"JD":lc.timeFormat == "Julian", "dtReference": tref},
        {"velocity":lc.velocity,"distance":lc.distance,"diameter":lc.diameter},
        operations
    )

@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([AllowAny])
def oi(request, *args, **kwargs):
    msg = ''
    if (request.method == 'DELETE'):
        msg = 'oi deletado!'
    elif (request.method == 'POST'):
        msg = 'oi inserido!'
    elif (request.method == 'GET'):
        msg = 'oi!'        
    else:
        return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "{} metodo nao permitido".format(request.method),
            },status=status.HTTP_400_BAD_REQUEST)    
    return  Response({
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': msg,
            })

        
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request, *args, **kwargs):
    msg = ''
    if (request.method == 'POST'):
        users = User.objects.filter(email=request.data.get("email"))        
        if users.count()==0:
            users = User.objects.filter(username=request.data.get("email"))
        user = users.first()
        if users.count()==0 or not user.check_password(request.data.get("password")):
            return  Response({
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': "{} user or password not found".format(request.data.get("email")),
                },status=status.HTTP_400_BAD_REQUEST)    
        msg = 'login success!'
    else:
        return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "{} metodo nao permitido".format(request.method),
            },status=status.HTTP_400_BAD_REQUEST) 
    refresh = RefreshToken.for_user(user)   
    return  Response({
                'name':user.username,
                'email':user.email,
                'email-verified':user.is_email_verified,
                'access-token':str(refresh.access_token),
                'refresh-token':str(refresh),
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': msg,
            })

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh(request, *args, **kwargs):
    msg = ''
    if (request.method == 'POST'):
        token = RefreshToken(request.data.get("refresh-token"))
        user_id=token.payload["user_id"]
        user = User.objects.get(id=user_id)
        try:
            token.verify()
        except Exception as error:
            return  Response({
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': "refresh token is invalid!",
                    'error': str(error),
                },status=status.HTTP_400_BAD_REQUEST)    
        msg = 'login success!'
    else:
        return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "{} metodo nao permitido".format(request.method),
            },status=status.HTTP_400_BAD_REQUEST) 
    refresh = RefreshToken.for_user(user)   
    return  Response({
                'name':user.username,
                'email':user.email,
                'access-token':str(refresh.access_token),
                'refresh-token':str(refresh),
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': msg,
            })

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def user_list(request):
    """
 List  users, or create a new user.
 """
    try:
        if request.method == 'GET':
            data = []
            page = request.GET.get('page', 1)
            nextPage = page
            previousPage = 1
            users = User.objects.all()
            paginator = Paginator(users, 10)
            try:
                data = paginator.page(page)
            except PageNotAnInteger:
                data = paginator.page(1)
            except EmptyPage:
                data = paginator.page(paginator.num_pages)

            serializer = UserListSerializer(data,context={'request': request} ,many=True)
            if data.has_next():
                nextPage = data.next_page_number()
            if data.has_previous():
                previousPage = data.previous_page_number()
            return Response({'data': serializer.data , 'page':page, 'count': paginator.count, 'numpages' : paginator.num_pages, 'nextlink': '?page=' + str(nextPage), 'prevlink': '?page=' + str(previousPage)})

        elif request.method == 'POST':
            serializer = UserCreateSerializer(data=request.data)
            if serializer.is_valid():
                # Check old password
                object = serializer.data
                if object.get('password') != object.get('confirm_password'):
                    return Response({"confirm password": ["password and confirm password must match."]}, status=status.HTTP_400_BAD_REQUEST)
                elif User.objects.filter(username=object.get('username')).count()>0:
                    return Response({"username": ["username already existing."]}, status=status.HTTP_400_BAD_REQUEST)
                elif User.objects.filter(email=object.get('email')).count()>0:
                    return Response({"email": ["email already existing."]}, status=status.HTTP_400_BAD_REQUEST)
                
                # set_password also hashes the password that the user will get
                user = User( username=object.get('username'), email=object.get('email'), is_staff=True, is_superuser=True)
                user.set_password(object.get('password'))
                user.save()
                send_activation_email(user)
                serializer = UserListSerializer(user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as error:
        return Response(str(error), status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def user_detail(request, id):
    """
 Retrieve, update or delete a project by id/pk.
 """
    try:
        user = User.objects.get(pk=id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = UserListSerializer(user,context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserUpdateSerializer(user, data=request.data,context={'request': request})
        if serializer.is_valid():
            object = serializer.validated_data
            if user.username!=object.get('username') and User.objects.filter(username=object.get('username')).count()>0:
                return Response({"username": ["username already existing."]}, status=status.HTTP_400_BAD_REQUEST)
            elif user.email!=object.get('email') and User.objects.filter(email=object.get('email')).count()>0:
                return Response({"email": ["email already existing."]}, status=status.HTTP_400_BAD_REQUEST)
            user.username = object.get('username')
            user.email = object.get('email')
            user.save()
            serializer = UserListSerializer(user,context={'request': request})
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)            

        

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def project_list(request):
    """
 List  projects, or create a new project.
 """
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        user = request.user
        projects = Project.objects.filter( user_id=user.id )
        page = request.GET.get('page', 1)
        paginator = Paginator(projects, 50)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        serializer = ProjectSerializer(data,context={'request': request} ,many=True)
        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()

        return Response({'data': serializer.data , 'count': paginator.count, 'numpages' : paginator.num_pages, 'nextlink': '/api/project/?page=' + str(nextPage), 'prevlink': '/api/project/?page=' + str(previousPage)})

    elif request.method == 'POST':
        user = request.user if request.user.is_authenticated else User.objects.all()[0]
        serializer = ProjectSerializer(user=user, data=request.data)
        if serializer.is_valid(raise_exception=False):
            serializer.save()
            data = request.data
            project = Project.objects.get(id=serializer.data['id'])
            task = TasksProducer(Job, user, project)
            for x in data['bodys']:
                body = Body.objects.get(bodyName=x['bodyName'], project=project)
                task.prediction(
                    body.id,
                    time_beg=data['initialDateTime'],
                    time_end=data['finalDateTime'],
                    body=x['bodyName'],
                    ephem=x['elementContent'],
                    mag_lim=data['limitingMagnitude'],
                    catalogue=data['catalogue'], 
                    step=data['searchStep'], 
                    divs=data['segments'], 
                    sigma=data['offEarthSigma'], 
                    reference_center=data['referenceCenter']
                )
            data = serializer.data
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def project_detail(request, id):
    """
 Retrieve, update or delete a project by id/pk.
 """
    try:
        project = Project.objects.get(id=id)
    except Project.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProjectSerializer(project,context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ProjectSerializer(project, data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)            



@api_view(['POST'])
def validate_body(request):
    if request.method == 'POST':
        serializer = ValidadeBodySerializer(data=request.data)
        if serializer.is_valid():
            object = serializer.validated_data
            p = TasksProducer(Job, None, None)
            if 'ephemname' in object and object.get('ephemname'):
                resp = p.validateBody(object.get('bodyname'),object.get('ephemname'))
            elif 'ephemcontent' in object and object.get('ephemcontent'):
                resp = p.validateBodyZipEphem(object.get('bodyname'),object.get('ephemcontent'))
            else:
                return Response({"error": ["ephemcontent and ephemname not found or are emptys."]}, status=status.HTTP_400_BAD_REQUEST)

            if 'validate' not in resp:
                return Response({"error": [str(resp)]}, status=status.HTTP_400_BAD_REQUEST)
            elif not resp['validate']:
                return Response({"error": [str(resp['error'])]}, status=status.HTTP_400_BAD_REQUEST)
            
            return Response({'bodyName':resp['name'], 'radius': resp['diameter']/2 }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def verify_email(request):
    if (request.method == 'POST'):
        token = request.data.get("token")
        user = request.user
        tk = generate_token.check_token(user, token.strip())
        if(user and tk):
            user.is_email_verified=True
            user.save()
            return  Response({
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': "Email was verified successfully!",
                })
        else:
            return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "invalid code!",
            })
    else:
        return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "{} metodo nao permitido".format(request.method),
            },status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def user_verify(request, *args, **kwargs):
    if (request.method == 'POST'):
        users = User.objects.filter(email=request.data.get("email"))        
        if users.count()==0:
            users = User.objects.filter(username=request.data.get("email"))
        if users.count()==0:        
            return  Response({
                    'status': 'error',
                    'code': status.HTTP_400_BAD_REQUEST,
                    'message': "{} user not found".format(request.data.get("email")),
                },status=status.HTTP_400_BAD_REQUEST)
    else:
        return  Response({
                'status': 'error',
                'code': status.HTTP_400_BAD_REQUEST,
                'message': "{} metodo nao permitido".format(request.method),
            },status=status.HTTP_400_BAD_REQUEST)   
    return  Response({               
                'status': 'success',
                'code': status.HTTP_200_OK,
                'message': 'user verify',
            })         


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def job_acao(request, action, idJob):
    task = TasksProducer(Job, None, None)
    job = Job.objects.get(id=idJob)
    if request.method == 'PUT' and action=='enqueue':
        result = task.reenqueueTask(job.guidTask)
        job.status = result.get('status')
        job.endedAt = None
        job.save()
    elif request.method == 'PUT' and action=='cancel':
        result = task.cancelTask(job.guidTask)
    elif request.method == 'GET' and action=='result':
        result = job.result
    elif request.method == 'GET' and action=='status':
        result = job.status
    else:
        return Response({'error':'method not allow'}, status=status.HTTP_400_BAD_REQUEST)
    return Response({'result': result}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def project_status_jobs(request, idProject):
    if request.method == 'GET':
        task = TasksProducer(Job, None, None)
        project = Project.objects.get(id=idProject)
        jobs =  Job.objects.filter(project=project)
        resp = []
        for job in jobs:
            taskStatus = task.status(job.guidTask)
            resp.append( { "idJob": job.id, "status": taskStatus } )
        return Response(resp, status = status.HTTP_200_OK)
    else:
        return Response({'error':'method not allow'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def project_jobs(request, idProject):
    if request.method == 'GET':
        project = Project.objects.get(id=idProject)
        jobs =  Job.objects.filter(project=project)
        resp = []
        for job in jobs:
            taskStatus = job.status
            resp.append( { "idJob": job.id, "name": job.name, "params":job.params, "createdAt": job.createdAt, "startedAt":job.startedAt, "endedAt":job.endedAt, "status": taskStatus } )
        return Response(resp, status=status.HTTP_200_OK)
    
    elif request.method == 'DELETE':
        job_status = request.data.get('status')
        query = Job.objects.filter(project_id=idProject)
        if job_status != 'all':
            query = query.filter(status=job_status)
        query.delete()
        return Response(status=status.HTTP_200_OK)
    
    else:
        return Response({'error':'method not allow'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def job_list(request):
    """
 List  projects, or create a new project.
 """
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        user = request.user
        jobs = Job.objects.filter(user_id=user.id).order_by('-createdAt')
        page = request.GET.get('page', 1)
        paginator = Paginator(jobs, 10)
        try:
            data = paginator.page(page)
        except PageNotAnInteger:
            data = paginator.page(1)
        except EmptyPage:
            data = paginator.page(paginator.num_pages)

        if data.has_next():
            nextPage = data.next_page_number()
        if data.has_previous():
            previousPage = data.previous_page_number()

        return Response({
            'data': data.object_list , 
            'count': paginator.count, 
            'numpages' : paginator.num_pages, 
            'nextlink': '/api/job/?page=' + str(nextPage), 
            'prevlink': '/api/job/?page=' + str(previousPage)
        })

    elif request.method == 'POST':
        user = request.user if request.user.is_authenticated else User.objects.all()[0]
        serializer = JobSerializer(user=user, data=request.data)
        if serializer.is_valid(raise_exception=False):
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
def job_detail(request, id):
    """
 Retrieve, update or delete a project by id/pk.
 """
    try:
        job = Job.objects.get(id=id)
    except Job.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = JobSerializer(job,context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = JobSerializer(job, data=request.data,context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        job.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)     
    
@api_view(['POST'])
def consolida_job(request):
    """
    update jobs states.
    """
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    project = Project.objects.get(id=request.data.get("projectId"))
    jobs = Job.objects.filter(project=project, endedAt=None).exclude(status='canceled')
    consolidation = []
    tp = TasksProducer(Job, user, project)
    for j in jobs:
        statusJob = tp.status(j.guidTask)
        consolidation.append({'id': j.id, 'name': j.name, 'status': statusJob, 'message': j.result})
        if statusJob != j.status:
            j.status = statusJob
            if statusJob == 'running':
                j.startedAt = datetime.datetime.now(tz=timezone.utc).isoformat()
            elif statusJob == "error":
                j.result = tp.result(j.guidTask)
                j.endedAt = datetime.datetime.now(tz=timezone.utc).isoformat()
            elif statusJob == "finished":
                j.result = tp.result(j.guidTask)
                j.endedAt = datetime.datetime.now(tz=timezone.utc).isoformat()
                if j.name.startswith("prediction"):
                    createDbPrediction(j)
                elif j.name.startswith("light_curve"):
                    lc = LightCurve.objects.get(id=j.modelId)
                    result = json.loads(j.result)
                    if(j.name.startswith("light_curve_plot")):
                        lc.json = result['light_curve']
                        lc.initialTime = result['initial_time']
                        lc.endTime = result['end_time']
                        lc.graficalFlux = result["image"]
                    elif(j.name.startswith("light_curve_occ_lcfit")):
                        lc.json = result["light_curve"]
                        lc.graficalFlux = result["image"]
                        job = tp.light_curve_chi2_image(lc.id, result["chi_square"])
                        consolidation.append({'id': job.id, 'name': job.name, 'status': job.status, 'message': job.result})
                    elif(j.name.startswith("light_curve_chi2_image")):
                        lc.graficalImmersion = result["immersion"]
                        lc.graficalEmersion = result["emersion"]
                        lc.graficalOpacity = result["opacity"]
                        job = tp.light_curve_model_image(lc.id, lc.json)
                        consolidation.append({'id': job.id, 'name': job.name, 'status': job.status, 'message': job.result})
                    elif(j.name.startswith("light_curve_model_image")):
                        lc.graficalModel = result['full_model']
                        lc.graficalModelImmersion = result['immersion_model']
                        lc.graficalModelEmersion = result['emersion_model']
                    elif(j.name.startswith("light_curve_results")):
                        lc.txtResult = result['txt_result']
                        lc.file1Result = result['file1']
                        lc.file2Result = result['file2']
                        lc.file3Result = result['file3']
                        lc.file4Result = result['file4']
                    lc.save()
                elif j.name.startswith("occultation"):
                    prediction = Prediction.objects.get(id=j.modelId)
                    result = json.loads(j.result)
                    if j.name.startswith("occultation_plot"):
                        prediction.graficalOccultation = result['plot']
                    elif j.name.startswith("occultation_fit_ellipse") or j.name.startswith("occultation_filter_negative_chord"):
                        prediction.graficalOccultation = result['ellipse']
                        prediction.ellipseChi2 = result['chi_square']
                        prediction.fittedOcc = result['fitted_occ']
                        job = tp.occultation_ellipse_chi2_image(prediction.id, result['chi_square'])
                        consolidation.append({'id': job.id, 'name': job.name, 'status': job.status, 'message': job.result})
                    elif j.name.startswith("occultation_ellipse_chi2_image"):
                        prediction.ellipseChi2Imgs = j.result
                    prediction.save()
                tp.removeTask(j.guidTask)
            j.save()
    return Response(consolidation, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_bodies_by_project(request, projectId):
    bodies = Body.objects.filter(project_id=projectId)
    serializer = BodySerializer2(bodies, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_predictions_by_project(request, projectId):
    bodies = Body.objects.filter(project_id=projectId)
    preds = []
    for b in bodies:
        bodyPred = Prediction.objects.filter(body_id=b.id)
        for pred in bodyPred:
            preds.append(pred)
    serializer = PredictionSerializer(preds, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def insert_light_curve(request, predictionId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    prediction = Prediction.objects.get(id=predictionId)
    star = Star.objects.get(prediction_id = predictionId)
    
    lc = LightCurve()
    lc.prediction = Prediction.objects.get(id=predictionId)
    lc.name = request.data.get("name")
    lc.dataFile = request.data.get("dataFile")
    lc.exposureTime = request.data.get("exposureTime")
    lc.timeColumnIndex = request.data.get("timeColumnIndex")
    lc.fluxColumnIndex = request.data.get("fluxColumnIndex")
    lc.fluxErrorColumnIndex = request.data.get("fluxErrorColumnIndex")
    lc.timeFormat = request.data.get("timeFormat")
    lc.referenceDate = request.data.get("referenceDate")
    lc.velocity = lc.prediction.vel
    lc.distance = lc.prediction.dist
    lc.diameter = star.diameter if star else 0
    lc.save()

    task = TasksProducer(Job, user, prediction.body.project)    
    plot_light_curve(lc, task, [])

    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
def light_curve_detect(request, lightCurveId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=lightCurveId)
    task = TasksProducer(Job, user, lc.prediction.body.project)

    detection = task.light_curve_detect(lc.json, {
        "maximum_duration": request.data.get('maxDuration') if 'maxDuration' in request.data else None,
        "dur_step": request.data.get('stepSize') if 'stepSize' in request.data else None,
        "snr_limit": request.data.get('snrLimit') if 'snrLimit' in request.data else None,
        "n_detections": request.data.get('numDetections') if 'numDetections' in request.data else None,
    })
    return Response(detection)

@api_view(['GET'])
def get_ligth_curve_by_prediction(request, predictionId):
    lCurves = LightCurve.objects.filter(prediction_id=predictionId)
    serializer = LigthCurveSerializer(lCurves, many=True)

    return Response(serializer.data)

@api_view(['GET'])
def get_ligth_curve_by_project(request, projectId):
    lCurvesList = []
    bodies = Body.objects.filter(project_id=projectId)
    for b in bodies:
        predictions = Prediction.objects.filter(body_id=b.id)
        for p in predictions:
            lCurves = LightCurve.objects.filter(prediction_id=p.id)
            for lc in lCurves:
                lCurvesList.append(lc)
    serializer = LigthCurveSerializer(lCurvesList, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_ligth_curve(request, lightCurveId):
    lc = LightCurve.objects.get(id=lightCurveId)
    serializer = LigthCurveSerializer(lc)
    return Response(serializer.data)

@api_view(['GET'])
def get_ligth_curve_results(request, lightCurveId):
    lc = LightCurve.objects.get(id=lightCurveId)
    serializer = LigthCurveResultsSerializer(lc)
    return Response(serializer.data)

@api_view(['PUT'])
def alter_light_curve(request, lightCurveId):
    lc = LightCurve.objects.get(id=lightCurveId)
    lc_json = json.loads(lc.json)
    lc_json['_name'] =  lc.name = request.data.get("name")
    lc_json['vel'] = lc.velocity = request.data.get("velocity")
    lc_json['dist'] = lc.distance = request.data.get("distance")
    lc_json['d_star'] = lc.diameter = request.data.get("diameter")
    lc.json = json.dumps(lc_json)
    lc.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
def light_curve_settings(request, lightCurveId):
    lc = LightCurve.objects.get(id=lightCurveId)
    lc_json = json.loads(lc.json)
    lc_json['_name'] = lc.name = request.data.get("name")
    lc.maxDuration = request.data.get("maxDuration")
    lc.stepSize = request.data.get("stepSize")
    lc.snrLimit = request.data.get("snrLimit")
    lc.numDetections = request.data.get("numDetections")
    lc.initialTime = request.data.get("initialTime")
    lc.endTime = request.data.get("endTime")
    lc.fluxMin = request.data.get("fluxMin")
    lc.fluxMax = request.data.get("fluxMax")
    lc.immersionTime = request.data.get("immersionTime")
    lc.emersionTime = request.data.get("emersionTime")
    lc.opacity = request.data.get("opacity")
    lc.dopacity = request.data.get("dopacity")
    lc.deltaT = request.data.get("deltaT")
    lc.sigma = request.data.get("sigma")
    lc.loop = request.data.get("loop")
    lc.sigmaResult = request.data.get("sigmaResult")
    lc.graficalFlux = request.data.get('graficalFlux')
    lc.json = json.dumps(lc_json)
    lc.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_light_curve(request, lightCurveId):
    lc = LightCurve.objects.get(id=lightCurveId)
    if(lc == None):
        return Response(status=status.HTTP_400_BAD_REQUEST)
    else:
        lc.delete()
        return Response(status=status.HTTP_200_OK)

@api_view(['DELETE'])
def delete_prediction(request, predictionId):
    p = Prediction.objects.get(id=predictionId)
    if(p == None):
        return Response(status=status.HTTP_400_BAD_REQUEST)
    else:
        p.delete()
        return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
def prediction_name(request, predictionId):
    p = Prediction.objects.get(id=predictionId)
    if(p == None):
        return Response(status=status.HTTP_400_BAD_REQUEST)
    else:
        p.name = request.data.get("name")
        p.save()
        return Response(status=status.HTTP_200_OK)


@api_view(['GET'])
def get_star(request, predicitionId):
    if Star.objects.filter(prediction_id=predicitionId).exists():
        star = Star.objects.get(prediction_id=predicitionId)
    else:
        pred = Prediction.objects.get(id=predicitionId)
        star = Star()
        star.code = pred.starCode if pred.starCode != None else "nostar"
        star.catalog = pred.body.project.catalog
        star.prediction = pred
        star.save()
    serializer = StarSerializer(star)
    return Response(serializer.data)

# @api_view(['PUT'])
def put_star(request):
    star = Star.objects.get(id=request.data.get("id"))
    star.code = request.data.get("code")
    star.catalog = request.data.get("catalogue")
    star.epoch = request.data.get("epoch")
    star.nomad = request.data.get("nomad")
    star.cgaudin = request.data.get("cgaudin")
    star.bjones = request.data.get("bjones")
    star.radVel = request.data.get("radVel")
    star.da_cosdec = request.data.get("da_cosdec")
    star.ddec = request.data.get("ddec")
    star.calculationType = request.data.get("mode")
    star.starType = request.data.get("starType")
    star.referenceMag = request.data.get("band")
    star.varV = request.data.get("V")
    star.varB = request.data.get("B")
    star.varK = request.data.get("K")
    star.varG = request.data.get("G")
    star.diameter = request.data.get("diameter")
    star.save()

    lcs = LightCurve.objects.filter(prediction_id=star.prediction.id)
    for lc in lcs:
        lc_json = json.loads(lc.json)
        lc_json['d_star'] = lc.diameter = star.diameter
        lc.json = json.dumps(lc_json)
        lc.save()

    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
def star_magnitudes(request):
    task = TasksProducer(Job, None, None)
    result = task.star_magnitudes(
        request.data.get("code"), 
        request.data.get("catalog"),
        request.data.get("nomad"),
        request.data.get("bjones"),
        request.data.get("cgaudin")
    )
    return Response(result)

@api_view(['POST'])
def star_calculate_diameter(request):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    star = Star.objects.get(id=request.data.get("id"))        
    serializer = StarDiameterValidator(data=request.data)
    if not request.data.get('diameter', None):
        if serializer.is_valid():
            task = TasksProducer(Job, user, star.prediction.body.project)
            object = serializer.validated_data
            result = task.star_calculate_diameter(**object, distance=star.prediction.dist)
            if isinstance(result, dict):
                request.data['diameter'] = float(result['diameter'].replace('km', ''))
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    put_star(request)
    return Response(request.data)

@api_view(['POST'])
def light_curve_fit(request, lightCurveId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=lightCurveId)
    task = TasksProducer(Job, user, lc.prediction.body.project)
    lc.__dict__.update(request.data)
    lc.save()
    task.light_curve_occ_lcfit(lc.id, lc.json, {
        "tmin": lc.initialTime, "tmax": lc.endTime,
        "immersion_time": lc.immersionTime, "emersion_time": lc.emersionTime,
        "flux_min": lc.fluxMin, "flux_max": lc.fluxMax, 
        "opacity": lc.opacity, "dopacity": lc.dopacity, "loop":lc.loop, 
        "sigma_result": lc.sigmaResult, "delta_t": lc.deltaT, "sigma": lc.sigma})
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
def light_curve_model(request, lightCurveId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=lightCurveId)
    task = TasksProducer(Job, user, lc.prediction.body.project)
    task.light_curve_model_image(lc.id, lc.json)
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
def light_curve_results(request, lightCurveId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=lightCurveId)
    task = TasksProducer(Job, user, lc.prediction.body.project)
    task.light_curve_results(lc.id, lc.json)
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
def light_curve_normalize(request, lightCurveId):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=lightCurveId)
    task = TasksProducer(Job, user, lc.prediction.body.project)
    lc.polyDeg = request.data.get('poly_deg')
    lc.initialTime = request.data.get('mask_min')
    lc.endTime = request.data.get('mask_max')
    lc.fluxMin = request.data.get('flux_min')
    lc.fluxMax = request.data.get('flux_max')
    lc.save()
    plot_light_curve(lc, task, [{"name":"normalize", "params": request.data}])
    return Response(status=status.HTTP_200_OK)

@api_view(['PUT'])
def light_curve_reset(request):
    user = request.user if request.user.is_authenticated else User.objects.all()[0]
    lc = LightCurve.objects.get(id=request.data.get('id'))

    lc.graficalModel = None
    lc.graficalModelImmersion = None
    lc.graficalModelEmersion = None
    lc.graficalImmersion = None
    lc.graficalEmersion = None
    lc.graficalOpacity = None
    lc.graficalFlux = None
    lc.initialTime = None
    lc.endTime = None
    lc.immersionTime = None
    lc.emersionTime = None
    lc.txtResult = None
    lc.file1Result = None
    lc.file2Result = None
    lc.file3Result = None
    lc.file4Result = None
    lc.save()

    task = TasksProducer(Job, user, lc.prediction.body.project)
    plot_light_curve(lc, task, [])
    serializer = LigthCurveSerializer(lc)
    return Response(data=serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
def light_curve_negate(request):
    lc = LightCurve.objects.get(id=request.data.get('id'))
    lc.negative = True
    lc_json = json.loads(lc.json)
    if '_immersion' in lc_json: del lc_json['_immersion']
    if '_emersion' in lc_json: del lc_json['_emersion']
    if 'immersion_err' in lc_json: del lc_json['immersion_err']
    if 'emersion_err' in lc_json: del lc_json['emersion_err']
    lc.json = json.dumps(lc_json)
    lc.save()
    return Response(status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'DELETE'])
def observer(request):
    if request.method == 'GET':
        bodies = Body.objects.filter(project_id=request.query_params['projectId'])
        preds = Prediction.objects.filter(body__in=bodies)
        obs = Observer.objects.filter(prediction__in=preds)
        return Response(ObserverSerializer(obs, many=True).data)
    elif request.method == 'POST':
        serializer = ObserverValidator(data=request.data)
        if (serializer.is_valid()):
            data = serializer.validated_data
            if 'id' in request.data:
                obs = Observer.objects.get(id=data['id'])
            else:
                obs = Observer()
                obs.prediction = Prediction.objects.get(id=data['predictionId'])
            obs.name = data['name']
            obs.latitude = data['latitude']
            obs.longitude = data['longitude']
            obs.altitude = data['altitude']
            obs.save()
            return Response(data=ObserverSerializer(obs).data, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if 'id' not in request.data:
            return  Response('Field id is required.', status=status.HTTP_400_BAD_REQUEST)

        obs = Observer.objects.get(id=request.data.get('id'))
        obs.delete()
        return Response(status=status.HTTP_200_OK)

@api_view(['GET', 'POST', 'DELETE'])
def chord(request):
    if request.method == 'GET':
        chord = Chord.objects.filter(prediction_id=request.query_params['predictionId'])
        result = {'chords': ChordSerializer(chord, many=True).data}
        ellipse = Ellipse.objects.filter(prediction_id=request.query_params['predictionId'])
        if ellipse.exists():
            result['ellipse'] = EllipseSerializer(ellipse.get()).data
        return Response(result)
    elif request.method == 'POST':
        serializer = ChordValidator(data=request.data)
        if (serializer.is_valid()):
            data = serializer.validated_data
            if 'id' in request.data:
                chord = Chord.objects.get(id=data['id'])
            else:
                chord = Chord()
                chord.prediction = Prediction.objects.get(id=data['predictionId'])
            chord.lightCurve = LightCurve.objects.get(id=data['lightCurveId'])
            chord.observer = Observer.objects.get(id=data['observerId'])
            chord.name = data['name']
            chord.color = data['color']
            chord.timeShift = data['timeShift']
            chord.save()
            return Response(data=ChordSerializer(chord).data, status=status.HTTP_200_OK)
        else:
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        if 'id' not in request.data:
            return  Response('Field id is required.', status=status.HTTP_400_BAD_REQUEST)

        chord = Chord.objects.get(id=request.data.get('id'))
        chord.delete()
        return Response(status=status.HTTP_200_OK)

def __build_occultation(prediction):
    star = Star.objects.get(prediction=prediction)
    chords = Chord.objects.filter(prediction=prediction)
    lc_fields = ['_name', '_initial_time', '_end_time', '_immersion', 'immersion_err', '_emersion', 'emersion_err']
    occ = {
        'star':{
            'catalogue': star.catalog,
            'code': star.code,
            'epoch': star.epoch,
            'rad_vel': star.radVel,
            'nomad': star.nomad,
            'bjones': star.bjones,
            'cgaudin': star.cgaudin
        },
        'body': {
            'name': prediction.body.bodyName,
            'ephem': prediction.body.ephemeris.replace('/JPL',''),
            'ephem_zip': prediction.body.ephemerisBSPzipFile
        },
        'time': prediction.epoch,
        'chords': list(map(lambda chord: {
            'name': chord.name,
            'color': chord.color.replace('#', ''),
            'time_shift': chord.timeShift,
            # 'linestyle': chord.linestyle,
            'observer': {
                'name': chord.observer.name,
                'lat': chord.observer.latitude,
                'lon': chord.observer.longitude,
                'height': chord.observer.altitude
            },
            'light_curve': {k.removeprefix('_'):v for k, v in json.loads(chord.lightCurve.json).items() if any(k == field for field in lc_fields)}
        }, chords))
    }

    if prediction.fittedOcc:
        occ['fitted_occ'] = json.loads(prediction.fittedOcc)
    return occ
    
@api_view(['POST'])
def plot_chords(request):
    if 'predictionId' not in request.data:
        return Response(data='Field predictionId is required.', status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user if request.user.is_authenticated else User.objects.first()
    prediction = Prediction.objects.get(id=request.data.get('predictionId'))
    prediction.graficalOccultation = None
    prediction.ellipseChi2Imgs = None
    prediction.ellipseChi2 = None
    prediction.fittedOcc = None
    prediction.save()
    task = TasksProducer(Job, user, prediction.body.project)
    occ_json = __build_occultation(prediction)
    params = {}
    if Ellipse.objects.filter(prediction=prediction).exists():
        ellipse = Ellipse.objects.filter(prediction=prediction).values('allEllipses', 'minX', 'maxX', 'minY', 'maxY', 'legendLocation').get()
        params.update(ellipse)
    task.occultation_plot(prediction.id, occ_json, None, params)
    return Response(status=status.HTTP_200_OK)

@api_view(['POST'])
def fit_ellipse(request):
    if 'predictionId' not in request.data:
        return Response(data='Field predictionId is required.', status=status.HTTP_400_BAD_REQUEST)

    serializer = EllipseValidator(data=request.data)
    if serializer.is_valid():
        user = request.user if request.user.is_authenticated else User.objects.first()
        prediction = Prediction.objects.get(id=request.data.get('predictionId'))
        task = TasksProducer(Job, user, prediction.body.project)
        occ_json = __build_occultation(prediction)
        
        params = serializer.validated_data
        if Ellipse.objects.filter(prediction=prediction).exists():
            query = Ellipse.objects.filter(prediction=prediction)
            query.update(**serializer.validated_data)
            params.update(query.values('minX', 'maxX', 'minY', 'maxY', 'legendLocation').get())
        else:
            Ellipse.objects.create(prediction=prediction, **serializer.validated_data)

        task.occultation_fit_ellipse(prediction.id, occ_json, params)
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
def filter_negative_chord(request):
    if 'predictionId' not in request.data:
        return Response('Field predictionId is required.', status=status.HTTP_400_BAD_REQUEST)

    serializer = FilterNegativeValidator(data=request.data)
    if serializer.is_valid():
        user = request.user if request.user.is_authenticated else User.objects.first()
        prediction = Prediction.objects.get(id=request.data.get('predictionId'))
        if not prediction.ellipseChi2:
            return Response('Ellipse wasn`t fitted yet.', status=status.HTTP_400_BAD_REQUEST)
        ellipse = Ellipse.objects.filter(prediction=prediction).values('allEllipses', 'minX', 'maxX', 'minY', 'maxY', 'legendLocation').get()
        task = TasksProducer(Job, user, prediction.body.project)
        occ_json = __build_occultation(prediction)
        params = serializer.validated_data
        params.update(ellipse)
        Ellipse.objects.filter(prediction=prediction).update(**serializer.validated_data)
        task.occultation_filter_negative_chord(prediction.id, occ_json, prediction.ellipseChi2, params)
        return Response(status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def ellipse_result(request):
    if 'predictionId' not in request.query_params:
        return Response('Field predictionId is required.', status=status.HTTP_400_BAD_REQUEST)
    
    prediction = Prediction.objects.get(id=request.query_params.get('predictionId'))
    task = TasksProducer(Job, None, None)
    occ_json = __build_occultation(prediction)
    ellipseResult = task.ellipse_result(occ_json)
    return Response(data=ellipseResult, status=status.HTTP_200_OK)

@api_view(['PUT'])
def occultation_plot(request):
    if 'predictionId' not in request.data:
        return Response('Field predictionId is required.', status=status.HTTP_400_BAD_REQUEST)

    user = request.user if request.user.is_authenticated else User.objects.first()
    prediction = Prediction.objects.get(id=request.data.get('predictionId'))
    query = Ellipse.objects.filter(prediction=prediction)
    params = request.data
    del params['predictionId']
    if Ellipse.objects.filter(prediction=prediction).exists():
        ellipse = query.values('allEllipses').get()
        query.update(**params)
        params.update(ellipse)
    else:
        Ellipse.objects.create(prediction=prediction, **params)
    
    occ_json = __build_occultation(prediction)
    task = TasksProducer(Job, user, prediction.body.project)
    task.occultation_plot(prediction.id, occ_json, prediction.ellipseChi2, params)
    return Response(status=status.HTTP_200_OK)