from django.http import JsonResponse


def handler404(*args, **kwargs):
    return JsonResponse({'error': {'message': 'The requested resource was not found.'}, 'code': 404}, status=404)
