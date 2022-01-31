from django.shortcuts import render
from django.db.models import Q
from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework import viewsets
from rest_framework import permissions
from rest_framework import status
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated   
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from .models import *
from .serializers import *

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


@api_view(['GET', 'POST', 'DELETE'])
def oi(request, *args, **kwargs):
    print(request)
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


@api_view(['GET', 'POST'])
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
def project_list(request):
    """
 List  projects, or create a new project.
 """
    if request.method == 'GET':
        data = []
        nextPage = 1
        previousPage = 1
        projects = Project.objects.all()
        page = request.GET.get('page', 1)
        paginator = Paginator(projects, 10)
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

        return Response({'data': serializer.data , 'count': paginator.count, 'numpages' : paginator.num_pages, 'nextlink': '/api/projects/?page=' + str(nextPage), 'prevlink': '/api/projects/?page=' + str(previousPage)})

    elif request.method == 'POST':
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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

