import re, math
SIDO = [('서울특별시', '서울'), ('서울시', '서울'), ('부산광역시', '부산'), ('대구광역시', '대구'), ('인천광역시', '인천'), ('광주광역시', '광주'),
        ('대전광역시', '대전'), ('울산광역시', '울산'), ('세종특별자치시', '세종'), ('경기도', '경기'), ('강원특별자치도', '강원'), ('강원도', '강원'),
        ('충청북도', '충북'), ('충청남도', '충남'), ('전북특별자치도', '전북'), ('전라북도', '전북'), ('전라남도', '전남'), ('전남광주통합특별시', '광주'),
        ('경상북도', '경북'), ('경상남도', '경남'), ('제주특별자치도', '제주')]
METRO = {'부산', '대구', '인천', '광주', '대전', '울산'}
def area(addr):
    a = addr or ''
    for k, v in SIDO: a = a.replace(k, v)
    p = a.split()
    if not p: return ''
    if p[0] == '서울' and len(p) > 1: return p[1]
    if '춘천' in a: return '춘천'
    if p[0] in METRO: return p[0] + (' ' + p[1] if len(p) > 1 and re.search(r'[구군]$', p[1]) else '')
    if p[0] == '세종': return '세종'
    if p[0] == '제주': return '제주 ' + re.sub(r'시$', '', p[1]) if len(p) > 1 and p[1].endswith('시') else '제주'
    if len(p) > 1 and re.search(r'[시군]$', p[1]):
        c = re.sub(r'[시군]$', '', p[1])
        return c if p[0] == '경기' else c
    return p[0]

def region(addr, la, lo):
    a = addr or ''
    if '춘천' in a or (la and 37.75 < la < 38.1 and 127.5 < lo < 128.0): return 'cc'
    if a.startswith('경기') or a.startswith('인천'): return 'gg'
    return 'se'


def norm(n):
    n = re.sub(r'\(.*?\)|㈜|\(주\)|주식회사|유한회사', '', n or '')
    n = re.sub(r'\s+|본점$|본관$|[0-9]호점$', '', n)
    return n.lower()
YCAT = [
    ('fine', r'프랑스|파인'),
    ('noodle', r'냉면|국수|칼국수|막국수|우동|소바|라면'),
    ('soup', r'국밥|해장국|곰탕|설렁탕|순대|감자탕|찌개|전골|매운탕|해물탕|닭요리|삼계'),
    ('meat', r'고기|돼지|소고기|양갈비|곱창|정육|스테이크|갈비|양꼬치|족발|보쌈|닭갈비|오리|장어'),
    ('sea', r'해물|생선|회|수산|낙지|주꾸미|조개|게요리|오징어|복어|아귀'),
    ('japanese', r'일식|초밥|돈가스|이자카야|일본'),
    ('chinese', r'중식|중국'),
    ('western', r'양식|이탈리|피자|멕시코|스페인|버거'),
    ('asian', r'인도|태국|베트남|아시아'),
    ('bunsik', r'분식|떡볶이|김밥|만두'),
    ('cafe', r'카페|디저트|초콜릿'),
]
def ysub(cat):
    for k, rx in YCAT:
        if re.search(rx, cat): return k
    return 'korean'

def kcat(cat):
    c2, _, c3 = cat.partition('>')
    t = cat
    if re.search(r'카페|커피|베이커리|제과|디저트|떡|아이스크림|도넛|빵', t):
        return 'cafe', 'bakery' if re.search(r'베이커리|제과|빵|도넛', t) else 'dessert' if re.search(r'디저트|떡|아이스크림', t) else 'cafe'
    if re.search(r'술집|와인|칵테일|호프|요리주점|이자카야|실내포장마차|맥주|바$', t):
        return 'bar', 'wine' if '와인' in t else 'cocktail' if re.search('칵테일|바$', t) else 'izakaya' if re.search('이자카야|일본식주점', t) else 'beer' if re.search('호프|맥주', t) else 'pocha'
    if re.search(r'뷔페|패스트푸드|치킨', t) and not re.search('한식', c2): pass
    return 'food', ysub(c3 + ' ' + c2) if c3 or c2 else 'korean'
