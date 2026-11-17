"""places.json + web/ → ../index.html (웹, 휴대폰 맞춤) 와 artifact.html (claude.ai 게시용)"""
import json, os, re
T = os.path.dirname(os.path.abspath(__file__))
W = os.path.join(T, 'web')
D = json.load(open(os.path.join(T, 'places.json'), encoding='utf8'))
rd = lambda f: open(os.path.join(W, f), encoding='utf8').read()
js = rd('app3.js').replace('//@@STYLE@@', rd('style_part.js'))
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
inner = ('<title>빅맵</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n<meta name="theme-color" content="#ffffff">\n'
         f'<style>{rd("maplibre.css")}</style>\n<style>{rd("app3.css")}</style>\n{rd("body3.html")}\n'
         '<script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>\n<script>\n'
         f'const DATA={J(D)};\n{js}</script>\n')
open(os.path.join(T, 'artifact.html'), 'w', encoding='utf8').write(inner)
web = ('<!doctype html>\n<html lang="ko"><head><meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">\n'
       '<meta name="apple-mobile-web-app-title" content="빅맵">\n<style>html,body{margin:0;padding:0;height:100%}</style>\n'
       '</head><body>\n' + inner + '\n</body></html>\n')
open(os.path.join(T, '..', 'index.html'), 'w', encoding='utf8').write(web)
print('places', len(D), 'web bytes', len(web.encode()))
