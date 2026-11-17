import re
DOW = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']; DKO = '일월화수목금토'
def kparse(H):
    oh, txt = {}, []
    for i, d in enumerate(H.split(',')):
        if d == '-': oh[DOW[i]] = []; txt.append('휴무'); continue
        if not d: txt.append(''); continue
        main, _, brk = d.partition('/')
        brk = brk.split('@')[0]; main = main.split('@')[0]
        m = re.match(r'(\d{1,2}):(\d\d)~(?:익일)?(\d{1,2}):(\d\d)', main)
        if not m: txt.append(''); continue
        a = int(m[1]) * 60 + int(m[2]); b = int(m[3]) * 60 + int(m[4])
        if b <= a: b += 1440
        iv = [[a, b]]
        for bb in brk.split('&'):
            mm = re.match(r'(\d{1,2}):(\d\d)~(\d{1,2}):(\d\d)', bb)
            if not mm: continue
            x = int(mm[1]) * 60 + int(mm[2]); y = int(mm[3]) * 60 + int(mm[4])
            if x < a: x += 1440; y += 1440
            out = []
            for s0, e0 in iv:
                if y <= s0 or x >= e0: out.append([s0, e0]); continue
                if x > s0: out.append([s0, x])
                if y < e0: out.append([y, e0])
            iv = out
        f = lambda v: '%02d:%02d' % (v // 60, v % 60)
        oh[DOW[i]] = [[f(x), f(y)] for x, y in iv]
        t = main.replace('~', '~') + (' (브레이크 ' + brk.replace('&', ', ') + ')' if brk else '')
        txt.append(t)
    # group days for display, Monday first
    order = [1, 2, 3, 4, 5, 6, 0]; groups = []
    for i in order:
        if groups and groups[-1][1] == txt[i]: groups[-1][0].append(i)
        else: groups.append([[i], txt[i]])
    parts = []
    for days, t in groups:
        if not t: continue
        if len(days) == 7: parts.append('매일 ' + t); continue
        lab = DKO[days[0]] + ('~' + DKO[days[-1]] if len(days) > 2 else ('·' + DKO[days[-1]] if len(days) == 2 else ''))
        parts.append(lab + ' ' + t if t != '휴무' else lab + ' 휴무')
    return oh, ' · '.join(parts)
