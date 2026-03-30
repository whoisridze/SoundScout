from app.core.config import settings
from app.services.deezer import deezer

if settings.demo_mode:
    from app.services.demo import DemoService
    spotify = DemoService()
else:
    from app.services.spotify import spotify  # noqa: F811
