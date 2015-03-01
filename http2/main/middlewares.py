from django.shortcuts import render_to_response
from django.template import RequestContext


class RenderBaseMiddleware(object):

    """
    Every request will just render base.html template.
    """

    def process_request(self, request):
        path = request.path

        not_base_render_keys = ['admin', 'api', 'media']

        not_render_base = any(key in path for key in not_base_render_keys)

        if not not_render_base:
            return render_to_response(
                'base.html',
                {},
                context_instance=RequestContext(request))
