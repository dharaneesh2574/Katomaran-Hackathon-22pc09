from aiohttp import web
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

async def handle(request):
    logger.info("Received request")
    return web.Response(text="Hello, World!")

app = web.Application()
app.router.add_get('/', handle)

if __name__ == '__main__':
    logger.info("Starting test server on port 5001...")
    web.run_app(app, port=5001) 