// www.diningcode.com 탭에서 실행 (주소 #c=k|이름|동;... 로 후보를 넘겨받음). 동마다 다이닝코드 순위 Top100을 받아 후보와 맞춰 봄(50위 안).
// 진행: window.__dn/__dq.length, 끝나면 window.__OK = [[k, rank, 동], ...], window.__ddone=1
(() => {
  const m = location.hash.match(/#c=(.*)$/); const CAND = decodeURIComponent(m[1]).split(';').map(e => e.split('|')); history.replaceState(null, '', location.pathname);
  const DCq = async q => { const h = await (await fetch('/rank/' + encodeURIComponent(q))).text(); const d = new DOMParser().parseFromString(h, 'text/html'); const out = []; for (const s of d.querySelectorAll('script[type="application/ld+json"]')) { try { const j = JSON.parse(s.textContent); const L = (Array.isArray(j) ? j : [j]).flatMap(x => x.itemListElement || x.mainEntity?.itemListElement || []); for (const it of L) out.push([it.position, it.name]) } catch (e) {} } return out };
  const HOME = new Set(['강서구 등촌동','강서구 화곡동','강서구 가양동','강서구 염창동','양천구 목동']);
  const Q = []; for (const d of [...new Set(CAND.map(c => c[2]))]) { Q.push(d); Q.push(d + ' 카페') }
  for (const x of HOME) for (const c of ['한식','일식','양식','중식','빵집','고기','국밥']) Q.push(x + ' ' + c);
  for (const x of ['등촌역','증미역','가양역','발산역','화곡역','우장산역','서대문역','대흥역','신촌역','이대역','합정역','망원역','염창역','목동역','광화문역']) { Q.push(x); Q.push(x + ' 카페') }
  window.__dq = Q; window.__dn = 0; const DC = {};
  const nz = s => (s || '').replace(/\(.*?\)|\s/g, '').toLowerCase(); const strip = s => nz(s).replace(/(본점|직영점|\S{1,4}점|[가-힣]{1,4}동|[가-힣]{1,3}역)$/, '');
  (async () => { for (const q of Q) { try { DC[q] = await DCq(q) } catch (e) { DC[q] = [] } window.__dn++; await new Promise(r => setTimeout(r, 1100)) }
    const idx = {}; for (const [q, L] of Object.entries(DC)) for (const [pos, n] of L) { if (pos > 50) continue; const k = strip(n).slice(0, 2); (idx[k] = idx[k] || []).push([q, pos, nz(n), strip(n)]) }
    const res = []; for (const [k, n, d] of CAND) { const N = nz(n), B = strip(n); let best = null; for (const [q, pos, dn, db] of (idx[B.slice(0, 2)] || [])) { if (!(q.startsWith(d) || (HOME.has(d) && /역/.test(q)))) continue; const ok = N.length <= 2 ? (db === N || dn === N) : (dn.startsWith(B) || dn === N || (db.length >= 3 && N.startsWith(db))); if (ok && (!best || pos < best)) best = pos } if (best) res.push([k, best, d]) }
    window.__OK = res; window.__OKHASH = '#ok=' + res.map(r => r[0] + ',' + r[1]).join(';'); window.__ddone = 1 })();
  return CAND.length + ' cands, ' + Q.length + ' queries';
})()
// 끝나면 카카오 탭으로 돌아가기: location.href = 'https://place.map.kakao.com/<아무 카카오 id>' + window.__OKHASH
