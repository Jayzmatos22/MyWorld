''' Curtidas: o router importa daqui '''
from app.services.likes.likes_service import add_like, get_likes, top_likes

__all__ = ["add_like", "get_likes", "top_likes"]
