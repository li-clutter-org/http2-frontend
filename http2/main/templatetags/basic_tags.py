from urllib.parse import urljoin
import json
import os

from django import template
from django.conf import settings
from django.templatetags.static import PrefixNode

register = template.Library()


@register.simple_tag
def render_js_files(file_location):
    """
    Loads js files references from 'file_location' parameter.

    Usage::

        {% render_js_files file_location %}

    Example::

        {% render_js_files 'js/general.json' %}

    This method is assuming 'file_location' is under settings.STATIC_DIR dir.

    """
    result = ""
    static_base_path = settings.STATIC_DIR
    json_js_files_path = os.path.join(static_base_path, file_location)
    json_data = open(json_js_files_path)
    data = json.load(json_data)
    files_dirs = data['files']
    json_data.close()
    src_template = "<script src='%s'></script>\n"
    for js_file_path in files_dirs:
        result += src_template % urljoin(
            PrefixNode.handle_simple("STATIC_URL"),
            js_file_path)

    return result
