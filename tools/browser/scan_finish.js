// place.map.kakao.com 탭에서 실행 (주소 #ok=k,rank;k,rank... 로 다이닝코드 결과를 넘겨받음).
// scan_kakao.js가 저장한 후보(localStorage 'bmQ')와 합쳐서, 이어서 kakao_details.js를 돌리면 bigmap_scan.json으로 내려받아짐.
(() => {
  const m = location.hash.match(/ok=([\d,;]*)/); const OK = m && m[1] ? m[1].split(';').map(e => e.split(',')) : []; history.replaceState(null, '', location.pathname);
  const Q = JSON.parse(localStorage.getItem('bmQ') || '{}');
  const S = OK.filter(([k]) => Q[k]).map(([k, r]) => [k, Q[k], +r]);
  window.__KS = S.map(x => x[0]); window.__KD = {}; window.__KDNAME = 'bigmap_scan.json';
  window.__KDWRAP = D => ({ S, D });
  return S.length;
})()
