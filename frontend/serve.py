"""Servidor de desenvolvimento com no-cache para evitar stale scripts."""
import http.server
import socketserver

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, *args):
        pass  # silenciar logs

with socketserver.TCPServer(("", 3000), NoCacheHandler) as httpd:
    httpd.serve_forever()
