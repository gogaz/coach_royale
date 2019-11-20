from django.shortcuts import render


def index(request):
    return render(request, 'index.html')


def manifest(request):
    return render(request, 'manifest.json')
