# we could do this as a celery scheduled task or as a normal cron

# from celery import shared_task

#@shared_task


def state_monitor():
    # looks for shared files and changes AnalysisInfo.status accordingly:
    # all modifications of the DB and file system we are thinking to do in the
    # GetAnalysisState view.

    # In this case the GetAnalysisState just return the AnalysisInfo, which
    # make for sense for a GET view: just get the current value, don't modify
    # anything:

    # >> class GetAnalysisState(RetrieveAPIView):
    # >>    """
    # >>    This view returns the status for the given analysis
    # >>    """
    # >>   serializer = ...
    # >>   ...

    pass
