# 빅맵 월간 자동 점검

매달 한 번 예약 작업이 이 순서대로 돌린다. 아노님의 맥북(크롬 + Claude in Chrome)이 켜져 있어야 한다.
결과는 https://victoryiknow.github.io/bigmap/ 에 반영되고, 끝나면 한 줄 요약을 알림으로 보낸다.

## 0. 준비
- `add_repo` victoryiknow/bigmap (access: push) → `git clone` → 작업 폴더 `bigmap/tools`.
- 커밋 작성자: `git config user.name victoryiknow`, `git config user.email victoryiknow@users.noreply.github.com`.
- 크롬 도구(mcp__claude-in-chrome__*)를 ToolSearch 한 번으로 불러오고 `tabs_context_mcp` → 새 탭에서 작업. 크롬이 안 잡히면 내장 브라우저(Claude_Browser)로 같은 일을 해 본다.
- 컴퓨터나 브라우저에 닿지 않으면 바로 멈추고 "맥북이 꺼져 있어 이번 달 점검을 못 했어요"라고 알린다.
- 이번 달: `YM=$(TZ=Asia/Seoul date +%Y-%m)`.

## 1. 있는 가게 다시 확인 (폐업·영업시간·메뉴)
1. `python3 -c "import json;print(','.join(str(p['kk']) for p in json.load(open('places.json')) if p.get('kk')))" > /tmp/ks.txt`
2. 크롬 새 탭에서 `https://place.map.kakao.com/147807403#ks=<ks.txt 내용>` 를 연다.
3. `browser/kakao_details.js` 내용을 javascript_tool로 실행. 30초 간격으로 `[window.__kd, window.__KS.length, window.__kdone]` 확인(대기는 한 번에 40초 이하). 약 15~20분.
4. 끝나면 `~/Downloads/bigmap_refresh.json` 이 생긴다. 크롬이 저장 위치를 묻는 창을 띄워 멈춰 있으면 알림으로 알리고 이 단계는 건너뛴다.
5. `device_stage_files` 로 가져와서 `python3 apply_refresh.py <파일> $YM`.
   - 결과가 `too_many_closed` 면 반영하지 않고 알림에 적는다(카카오 응답이 바뀐 경우).

## 2. 새 맛집 찾기 (서울)
기준: 카카오 평점 4.2+·리뷰 30+ **그리고** 다이닝코드 동네 순위 50위 안. 카카오 점수만으로는 넣지 않는다. 프랜차이즈·술집 제외.
1. 1단계와 **같은 탭**에서 `browser/scan_kakao.js` 실행(이미 있는 가게는 자동으로 뺌). `[window.__st, window.__n, window.__tot]` 를 보며 'done' 까지(30~40분).
2. `location.href = 'https://www.diningcode.com/' + window.__CHASH` 실행 → 다이닝코드 탭이 열리면 `browser/dc_match.js` 실행. `[window.__dn, window.__dq.length, window.__ddone]` 확인(약 20~30분).
   - 다이닝코드가 막히거나(WAF 확인 화면 등) 결과가 0이면 2단계는 건너뛴다. 확인 화면을 우회하지 않는다.
3. `location.href = 'https://place.map.kakao.com/147807403' + window.__OKHASH` → 카카오 탭에서 `browser/scan_finish.js` 실행 후 이어서 `browser/kakao_details.js` 실행 → `~/Downloads/bigmap_scan.json`.
4. 가져와서 `python3 apply_new.py <파일> $YM`.

## 3. 반영
1. `python3 render.py` → `../index.html` 이 새로 만들어진다.
2. 바뀐 게 있으면 커밋·푸시: `git add -A && git commit -m "$YM 자동 점검: 폐업 N곳 제외, 영업시간 N곳 갱신, 새 맛집 N곳" && git push`.
3. 내려받은 `bigmap_refresh.json`, `bigmap_scan.json` 은 맥의 `~/Downloads/_삭제예정/빅맵 자동점검/` 으로 옮긴다(지우지 않는다).
4. PushNotification 한 줄: "빅맵 $YM 점검: 폐업 N곳 뺌(이름 몇 개), 영업시간 N곳 바뀜, 새 맛집 N곳(이름 몇 개)". 문제가 있었으면 그것도 짧게.

## 지킬 것
- 집 주소를 페이지나 커밋에 넣지 않는다.
- 로그인·캡차·차단 화면은 우회하지 않는다. 막히면 건너뛰고 알린다.
- 새로 넣는 가게에 소개글을 지어 쓰지 않는다(출처 있는 내용만).
- 맥에서 파일을 지우지 않는다.
