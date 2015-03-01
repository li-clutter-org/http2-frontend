from django.conf import settings


def debug_set(request):
    return {'debug_set': settings.DEBUG}
