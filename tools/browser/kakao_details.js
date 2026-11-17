// place.map.kakao.com 탭에서 실행. 카카오 id 목록(window.__KS 또는 주소 #ks=1,2,3)의 영업시간·메뉴·주소·상태를 받아 파일로 저장.
// 진행: window.__kd / window.__KS.length, 끝나면 window.__kdone=1 이고 다운로드됨.
(() => {
  const NAME = window.__KDNAME || 'bigmap_refresh.json';
  if (!window.__KS) { const m = location.hash.match(/ks=([\d,]+)/); window.__KS = m ? m[1].split(',') : []; history.replaceState(null, '', location.pathname); }
  const one = async k => { const r = await fetch('/places/panel3/' + k, { headers: { pf: 'web' } }); if (r.status === 404) return null; if (!r.ok) throw r.status; const j = await r.json(); const oh = j.open_hours || {}; const H = {};
    for (const d of (oh.week_from_today?.week_periods || []).flatMap(w => w.days || [])) { const w = (d.day_of_the_week_desc || '')[0]; if (!w) continue;
      if (d.on_days) { const o = d.on_days; const s = (o.start_end_time_desc || '').replace(/\s/g, ''); const b = (o.break_times_desc || []).map(x => x.replace(/브레이크타임|\s/g, '')).join('&'); H[w] = s + (b ? '/' + b : '') } else if (d.off_days_desc) H[w] = '-' }
    const X = oh.headline_addition?.current_off_day_desc || ''; const M = (j.menu?.menus?.items || []).slice(0, 12).map(m => (m.name || '').replace(/[;~|]/g, ' ') + (m.price ? '~' + m.price : '')).join(';'); const s = j.summary || {};
    return ['일월화수목금토'.split('').map(w => H[w] ?? '').join(','), X, M, [s.address?.disp || s.address?.road || '', (s.category?.name2 || '') + '>' + (s.category?.name3 || ''), s.status || '', s.point ? +s.point.lat.toFixed(5) : 0, s.point ? +s.point.lon.toFixed(5) : 0]] };
  window.__KD = window.__KD || {}; window.__kd = 0; window.__kdone = 0;
  (async () => { for (const k of window.__KS) { if (!(k in window.__KD)) { for (let t = 0; t < 2; t++) { try { window.__KD[k] = await one(k); break } catch (e) { await new Promise(r => setTimeout(r, 1500)) } } } window.__kd++ }
    let out = window.__KD; if (window.__KDWRAP) out = window.__KDWRAP(out);
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' })); a.download = NAME; document.body.appendChild(a); a.click(); window.__kdone = 1 })();
  return window.__KS.length;
})()
