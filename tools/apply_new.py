"""새 맛집 추가: python3 apply_new.py scan.json YYYY-MM
scan.json = {"S": [[kakao_id, [이름, lat, lon, 카테고리, 리뷰수, 평점, 동], 다이닝코드순위], ...], "D": {kakao_id: [H, X, M, A]}}
기준: 카카오 평점 4.2+ & 리뷰 30+ 이면서 다이닝코드 동네 순위 50위 안 (스캔 단계에서 거름). 술집은 뺌."""
import json, os, sys, math
from kparse import kparse
from cats import kcat, norm, area
T = os.path.dirname(os.path.abspath(__file__))
X = json.load(open(sys.argv[1], encoding='utf8')); ym = sys.argv[2]
D = json.load(open(os.path.join(T, 'places.json'), encoding='utf8'))
have = {str(p.get('kk')) for p in D if p.get('kk')}
def near(p, la, lo): return math.hypot((p['la'] - la) * 111, (p['lo'] - lo) * 88) < 0.15
def sid(n, la, lo):
    s = norm(n) + '|' + f"{la:.3f}|{lo:.3f}"; h = 0
    for ch in s: h = (h * 31 + ord(ch)) & 0xffffffff
    return 'p' + format(h, 'x')
added = []
for k, r, rank in X['S']:
    k = str(k); d = X['D'].get(k)
    if k in have or not d or not r: continue
    H, Xo, M, A = d
    if not A or not A[3] or (A[2] and A[2] != 'Y'): continue
    c, s = kcat(A[1] or r[3])
    if c == 'bar': continue
    la, lo = A[3], A[4]
    if any(norm(q['n']) == norm(r[0]) and near(q, la, lo) for q in D): continue
    p = {'kk': k, 'id': sid(r[0], la, lo), 'n': r[0], 'c': c, 's': s, 'a': area(A[0]), 'addr': A[0], 'la': la, 'lo': lo,
         'x': ['dcode'], 'dcr': rank, 'kr': [r[5], r[4]], 'nc': r[3]}
    if H and H.replace(',', ''):
        oh, txt = kparse(H)
        if oh: p['oh'] = oh; p['h'] = txt + (' · ' + Xo if Xo else ''); p['hd'] = '카카오맵 ' + ym
    elif Xo: p['kx'] = Xo
    if M: p['m'] = ', '.join(x.replace('~', ' ') for x in M.split(';') if x)
    D.append(p); have.add(k); added.append(p['n'] + ' (' + p['a'] + ')')
json.dump(D, open(os.path.join(T, 'places.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps({'added': added, 'total': len(D)}, ensure_ascii=False))
