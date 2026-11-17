// place.map.kakao.com 탭에서 실행. 서울 25개 구의 동별 카카오 인기 순위에서 평점 4.2+·리뷰 30+ 후보를 모음.
// 먼저 kakao_details.js(재확인)를 같은 탭에서 돌렸다면 그 목록(window.__KS)에 있는 곳은 후보에서 뺌.
// 진행: window.__st('dongs'|'scan'|'done'), window.__n/__tot. 끝나면 후보는 window.__C, 원본은 localStorage 'bmQ'.
(() => {
  const RG = async (reg, c) => { try { return (await (await fetch(`/api/rank/places/search?region=${reg}&type=search&category-or-menu=${c}&limit=50`, { headers: { pf: 'web' } })).json()).items || [] } catch (e) { return [] } };
  const CATS = ['category_korean','category_western','category_japanese','category_chinese','category_asian','category_cafe','menu_bread','menu_finedining','menu_katsu','menu_kalguksu','menu_sushi','menu_gukbap','menu_porkbelly','menu_dumpling','menu_champon','menu_ricenoodle','menu_burger','menu_pizza','menu_sashimi','menu_tteokbokki','menu_chicken'];
  const CH = /스타벅스|투썸|이디야|메가MGC|메가커피|컴포즈|빽다방|폴바셋|블루보틀|파리바게뜨|뚜레쥬르|맥도날드|버거킹|롯데리아|맘스터치|KFC|서브웨이|본죽|김밥천국|교촌|BBQ|bhc|쉐이크쉑|파이브가이즈|노티드|런던베이글|공차|할리스|커피빈|엔제리너스|탐앤탐스|더벤티|홍콩반점|한신포차|새마을식당|역전우동|원할머니|놀부|채선당|명륜진사|하남돼지집|도미노|피자헛|파파존스|아웃백|빕스|애슐리|쿠우쿠우|청년다방|신전떡볶이|엽기떡볶이|배스킨|설빙|던킨|크리스피|매머드|텐퍼센트|백미당|두끼|고봉민|이삭토스트|샐러디|본도시락|한솥|굽네|처갓집|네네|노랑통닭|호식이|육쌈|역전할머니|봉추찜닭|이차돌|하이디라오|딘타이펑|아우어베이커리|밀도|테라로사|프릳츠|빈브라더스|커피에반하다|감성커피|카페봄봄|더리터|하삼동|바나프레소|와플대학|땅땅치킨|60계|자담|푸라닭|지코바|멕시카나|페리카나|피자스쿨|피자마루|7번가|반올림피자|김가네|바르다김선생|고피자|서가앤쿡|도쿄등심|미분당|롤링파스타|알촌|명랑핫도그|국대떡볶이|응급실떡볶이|가마로강정|요거프레소|빌리엔젤|카페드파리|요아정|오레노라멘|홍대개미|짬뽕지존|부엉이돈가스/;
  const BAR = /술집|호프|이자카야|요리주점|포장마차|와인|칵테일|맥주|바$/;
  const HAVE = new Set(window.__KS || []); window.__Q = {}; window.__st = 'dongs';
  (async () => { const dongs = {}; for (let g = 0; g < 25; g++) { for (const c of ['category_korean','category_cafe','category_western','category_japanese','category_chinese','menu_bread','category_asian']) for (const it of await RG('I' + (1000 + g), c)) { const r = it.regions?.[2]; if (r) dongs[r.id] = it.regions[1].name + ' ' + r.name } }
    window.__st = 'scan'; const ids = Object.keys(dongs); window.__tot = ids.length * CATS.length; let n = 0;
    for (const id of ids) for (const c of CATS) { for (const it of await RG(id, c)) if ((it.review_rating || 0) >= 4.2 && (it.review_count || 0) >= 30) window.__Q[it.confirm_id] = [it.name, +it.lat.toFixed(5), +it.lon.toFixed(5), it.category_name, it.review_count, it.review_rating, dongs[id]]; window.__n = ++n }
    window.__C = Object.entries(window.__Q).filter(([k, x]) => !HAVE.has(String(k)) && !CH.test(x[0]) && !/\s\S+점$/.test(x[0].replace(/\s(본점|\S*본점)$/, '')) && !BAR.test(x[3]));
    localStorage.setItem('bmQ', JSON.stringify(Object.fromEntries(window.__C))); window.__st = 'done';
    window.__CHASH = '#c=' + encodeURIComponent(window.__C.map(([k, x]) => [k, x[0].replace(/[|;]/g, ' '), x[6]].join('|')).join(';')) })();
  return 'started';
})()
