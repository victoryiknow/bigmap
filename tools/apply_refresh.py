"""카카오맵 재확인 결과 반영: python3 apply_refresh.py refresh.json YYYY-MM
refresh.json = {kakao_id: [H, X, M, [addr, cat, status, lat, lon]] 또는 null}
- 카카오맵에서 폐업(status가 Y가 아님)으로 나온 곳은 뺌
- 영업시간·휴무·메뉴는 새 값으로 바꿈 (새 값이 비어 있으면 그대로 둠)"""
import json, os, sys
from kparse import kparse
T = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(sys.argv[1], encoding='utf8')); ym = sys.argv[2]
D = json.load(open(os.path.join(T, 'places.json'), encoding='utf8'))
out, closed, changed, missing = [], [], 0, 0
for p in D:
    k = str(p.get('kk') or ''); r = R.get(k) if k else None
    if not k or k not in R: out.append(p); continue
    if r is None: missing += 1; out.append(p); continue
    H, X, M, A = r
    if A and A[2] and A[2] != 'Y':
        closed.append(p['n'] + ' (' + (p.get('a') or '') + ')'); continue
    before = (p.get('h'), p.get('m'))
    if H and H.replace(',', ''):
        oh, txt = kparse(H)
        if oh: p['oh'] = oh; p['h'] = txt + (' · ' + X if X else ''); p['hd'] = '카카오맵 ' + ym; p.pop('kx', None)
    elif X: p['kx'] = X
    if M: p['m'] = ', '.join(x.replace('~', ' ') for x in M.split(';') if x)
    if (p.get('h'), p.get('m')) != before: changed += 1
    out.append(p)
# 한 번에 너무 많이 빠지면 카카오 응답 형식이 바뀐 것일 수 있으니 반영하지 않음
if len(closed) > max(30, len(R) * 0.03):
    print(json.dumps({'error': 'too_many_closed', 'closed_count': len(closed), 'sample': closed[:10]}, ensure_ascii=False)); sys.exit(2)
json.dump(out, open(os.path.join(T, 'places.json'), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
print(json.dumps({'checked': len(R), 'closed': closed, 'changed': changed, 'no_answer': missing, 'total': len(out)}, ensure_ascii=False))
