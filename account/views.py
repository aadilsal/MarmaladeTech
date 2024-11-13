from django.shortcuts import render,redirect,get_object_or_404
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User,auth
from .models import Profile
from quiz.models import Quiz
from quiz.models import QuizSubmission

# Create your views here.
def regsiter(request):
    if request.user.is_authenticated:
        return redirect('profile',request.user.username)

    if request.method=="POST":
        email=request.POST['email']
        username=request.POST['username']
        password=request.POST['password']
        password2=request.POST['password2']

        if password == password2:
            print("Password Match")
            #check if username does exsist
            if User.objects.filter(username=username).exists():
                messages.info(request, "Username Taken")
                return redirect('register')
            #check if email does exists
            elif User.objects.filter(email=email).exists():
                messages.info(request, "Email already Exists. Try to Login")
                return redirect('register')
            
            #create user
            else:
                user=User.objects.create_user(username=username,email=email,password=password)
                user.save()

                #login User and redirect to profiel.html
                user_login=auth.authenticate(username=username,password=password)
                auth.login(request,user_login)

                #create profile for new user
                user_model=User.objects.get(username=username)
                new_profile=Profile.objects.create(user=user_model)
                new_profile.save()

                return redirect('profile',user_model.username) #redirect to login

        else:
            messages.info(request, "Password Doesnot Match")
            return redirect('register')

    context={}
    return render(request,"register.html",context)

@login_required(login_url='login')
def profile(request,username):
    #profile user
    #user_object2=User.objects.get(username=username)
    user_object2=get_object_or_404(User,username=username)
    #user_profile2=Profile.objects.get(user=user_object2)
    user_profile2=get_object_or_404(Profile,user=user_object2)
    #request user
    #user_object=User.objects.get(username=request.user)
    user_object=get_object_or_404(User,username=username)
    #user_profile=Profile.objects.get(user=user_object)
    user_profile=get_object_or_404(Profile,user=user_object)
    submissions=QuizSubmission.objects.filter(user=user_object2)


    context={"user_profile":user_profile,"user_profile2":user_profile2,"submissions":submissions}
    return render(request,'profile.html',context)



@login_required(login_url='login')
def editProfile(request):
    user_object = User.objects.get(username=request.user)
    user_profile = Profile.objects.get(user=user_object)

    if request.method == "POST":
        # Image
        if request.FILES.get('profile_img') is not None:
            user_profile.profile_img = request.FILES.get('profile_img')
            user_profile.save()

        # Email
        new_email = request.POST.get('email')
        if new_email:
            if User.objects.filter(email=new_email).exists():
                if User.objects.get(email=new_email) != user_object:
                    messages.info(request, "Email already used!")
                    return redirect('edit_profile')
            else:
                user_object.email = new_email
                user_object.save()

        # Username
        new_username = request.POST.get('username')
        if new_username:
            if User.objects.filter(username=new_username).exists():
                if User.objects.get(username=new_username) != user_object:
                    messages.info(request, "Username already used!")
                    return redirect('edit_profile')
            else:
                user_object.username = new_username
                user_object.save()

        # First name and last name
        user_object.first_name = request.POST.get('first_name')
        user_object.last_name = request.POST.get('last_name')
        user_object.save()

        # Location, bio, gender
        user_profile.location = request.POST.get('location')
        user_profile.gender = request.POST.get('gender')
        user_profile.bio = request.POST.get('bio')
        user_profile.save()

        return redirect('profile', user_object.username)

    context = {"user_profile": user_profile}
    return render(request, 'profile-edit.html', context)

@login_required(login_url='login')
def deleteProfile(request):
    user_object = User.objects.get(username=request.user)
    user_profile = Profile.objects.get(user=user_object)

    if request.method== "POST":
        user_profile.delete()
        user_object.delete()
        return redirect('logout')

    context={"user_profile":user_profile}
    return render(request,'confirm.html',context)

def login(request):
    if request.user.is_authenticated:
        return redirect('profile',request.user.username)

    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']

        user = auth.authenticate(username=username, password=password)
        if user is not None:
            auth.login(request, user)
            return redirect('profile', user.username)
        else:
            messages.info(request, 'Credentials are incorrect')
            return redirect('login')

    return render(request, "login.html")

@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    return redirect('login')

