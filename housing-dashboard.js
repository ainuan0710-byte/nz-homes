(() => {
  const homes = (window.NZ_HOMES || []).filter(h => h.currentListing);
  const school = {lat:-36.8065311,lng:174.7918802};
  let rate = window.NZD_TO_KRW || 739;
  let selected = null, filter = 'all', sourceFilter = 'all', pendingPlace = null, confirmedPlace = null;
  let saved;
  try { saved = new Set(JSON.parse(localStorage.getItem('eh-nz-homes-v2') || 'null') || homes.filter(h=>h.shortlisted).map(h=>h.id)); } catch { saved = new Set(); }
  const esc = s => String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const toKrwMan = nzd => {
    const krw = Math.round(Number(nzd) * rate);
    const man = (krw / 10000).toFixed(1).replace(/\.0$/, '');
    return { krw, man, full: `약 ${man}만 원 (₩${krw.toLocaleString()})` };
  };

  const toAreaPyeong = h => {
    if (Number.isFinite(h.area)) {
      const py = (h.area / 3.305785).toFixed(1);
      return `${h.area}㎡ (약 ${py}평)`;
    }
    return h.areaEstimate || '면적 미공개 (평수 미상)';
  };

  const distance = h => {
    if (!Number.isFinite(h.lat)||!Number.isFinite(h.lng)) return null;
    const rad=x=>x*Math.PI/180, dlat=rad(h.lat-school.lat),dlng=rad(h.lng-school.lng);
    return 6371000*2*Math.atan2(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(rad(school.lat))*Math.cos(rad(h.lat))*Math.sin(dlng/2)**2),Math.sqrt(1-(Math.sin(dlat/2)**2+Math.cos(rad(school.lat))*Math.cos(rad(h.lat))*Math.sin(dlng/2)**2)));
  };
  const focus = id => {selected=id; pendingPlace=id; confirmedPlace=null; window.dispatchEvent(new CustomEvent('eh-focus-place',{detail:id}));render();};
  const openSV = id => {focus(id); window.dispatchEvent(new CustomEvent('eh-open-streetview',{detail:id}));};
  const aside = document.createElement('aside');aside.className='housing-panel';aside.setAttribute('aria-label','뉴질랜드 주거 검토 대시보드');aside.id='nz-housing-panel';aside.hidden=true;document.body.append(aside);
  const toggle=document.createElement('button');toggle.id='btn-housing';toggle.type='button';toggle.textContent='뉴질랜드 집 열기';toggle.setAttribute('aria-controls',aside.id);toggle.setAttribute('aria-expanded','false');document.querySelector('.bar').append(toggle);
  function setOpen(open){aside.hidden=!open;document.body.classList.toggle('with-housing',open);toggle.textContent=open?'뉴질랜드 집 접기':'뉴질랜드 집 열기';toggle.setAttribute('aria-expanded',String(open));if(open)focus('nz-school');window.dispatchEvent(new Event('resize'));}
  toggle.onclick=()=>setOpen(aside.hidden);

  function render(){
    const b2Count = homes.filter(h=>h.sourceType==='belmont2').length;
    const z1Count = homes.filter(h=>h.sourceType==='zone1').length;
    const takaCount = homes.filter(h=>h.sourceType==='takapuna').length;
    const z2aCount = homes.filter(h=>h.sourceType==='zone2a').length;
    const z2bCount = homes.filter(h=>h.sourceType==='zone2b').length;
    const filtered = homes.filter(h=>(filter==='all'||saved.has(h.id))&&(sourceFilter==='all'||(sourceFilter==='toppick'&&h.isTopPick)||h.sourceType===sourceFilter||(sourceFilter==='zone1_all'&&(h.sourceType==='belmont2'||h.sourceType==='zone1'))));
    const topPickWeekly = toKrwMan(750);
    const topPickMonthly = toKrwMan(Math.round(750*52/12));

    aside.innerHTML=`<header class="housing-head"><button type="button" class="housing-close" aria-label="뉴질랜드 대시보드 접기">접기 ×</button><div class="eyebrow">NEW ZEALAND · BELMONT &amp; TAKAPUNA</div><h1>학교 가까이, 우리 집.</h1><p>👑 정이사님 원픽 1순위는 <b>207/28 Killarney St (Lakeview 2층 · 주 NZ$750 / 약 55.4만 원 · 80㎡ / 약 24.2평)</b>입니다. 모든 금액에 <b>NZ$ + 한화(₩)</b>, 모든 면적에 <b>㎡ + 평수(평)</b>를 병기합니다.</p><div class="housing-stats"><div><b>${homes.length}</b><span>현재 공고</span></div><div><b>${b2Count} / ${takaCount}</b><span>벨몬트2차 / 타카푸나</span></div><div><b>${saved.size}</b><span>관심 후보</span></div></div></header>
    <section class="toppick-banner ${confirmedPlace==='h29'?'selected':''}">
      <div class="eyebrow">👑 정이사님 지정 원픽 1순위 (황금 핀 '★') · 2026-12-29 입주</div>
      <h2>207/28 Killarney Street, Takapuna</h2>
      <p><b>주 NZ$750 (약 ${topPickWeekly.man}만 원 · 월 약 ${topPickMonthly.man}만 원)</b> · <b>80㎡ (약 24.2평)</b> · 침실2·욕실2·지하보안주차1<br>2019년 준공 Lakeview 2층(엄마+초등2명 안전·사생활 최우수) · 호수공원(Killarney Park) 바로 앞</p>
      <div class="toppick-actions">
        <button type="button" data-focus="h29">👑 원픽 3D 위치 보기</button>
        <button type="button" data-sv="h29" class="btn-sv">원픽 앞 로드뷰</button>
        <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/takapuna/listing/6224609815" target="_blank" rel="noopener">Trade Me 공고 원문 ↗</a>
      </div>
    </section>
    <section class="school-card ${confirmedPlace==='nz-school'?'selected':''}"><div class="eyebrow">🟢 기준점 (초록 핀 '학') · 국제학생 학군 무관</div><h2>Belmont Primary School</h2><p>3A Harrison Avenue, Belmont, Auckland</p><button type="button" data-school>3D 학교 보기</button><button type="button" data-school-sv style="margin-left:6px;background:#0f1c30">학교 앞 로드뷰</button><a href="https://www.google.com/maps/search/?api=1&query=Belmont+Primary+School,+3A+Harrison+Avenue,+Auckland" target="_blank" rel="noopener">구글 지도 ↗</a><p class="school-feedback" role="status" aria-live="polite">${confirmedPlace==='nz-school'?'학교 핀과 상세 정보를 지도에 표시했습니다.':''}</p></section>
    <section class="westgate-card"><div class="eyebrow">🩵 가족 생활권 (청록 핀 '가')</div><h2>웨스트게이트 <small>Westgate</small></h2><p>아내분 사촌동생 거주 지역 · 학교에서 차로 <b>약 21분 (23.7km · SH18 경유)</b></p><div><button type="button" data-westgate>웨스트게이트 위치</button><button type="button" data-nz-overview>학교와 한눈에 보기</button></div></section>
    <section class="portal-card">
      <div class="eyebrow">직접 탐색 · 현지 5대 부동산 포털</div>
      <h2>권역별 매물 사이트 바로가기</h2>
      <p class="portal-desc"><b>🔵 권역1(파란 핀 '1')</b>: Belmont · Bayswater (${z1Count}건)<br><b>🟣 타카푸나(보라 핀 '타')</b>: Takapuna 상권·해변·SH1 진입 (${takaCount}건)<br><b>🟠 권역2(주황 핀 '2')</b>: Hauraki · Narrow Neck · Devonport (${z2aCount+z2bCount}건)</p>
      <div class="portal-group">
        <b>1. Trade Me Property (최대 매물)</b>
        <div class="portal-links">
          <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/belmont" target="_blank" rel="noopener">Belmont ↗</a>
          <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/bayswater" target="_blank" rel="noopener">Bayswater ↗</a>
          <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/takapuna" target="_blank" rel="noopener">Takapuna ↗</a>
          <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/hauraki" target="_blank" rel="noopener">Hauraki ↗</a>
          <a href="https://www.trademe.co.nz/a/property/residential/rent/auckland/north-shore-city/devonport" target="_blank" rel="noopener">Devonport·Narrow Neck ↗</a>
        </div>
      </div>
      <div class="portal-group">
        <b>2. Realestate.co.nz · 3. Barfoot &amp; Thompson · 4. myRent · 5. OneRoof</b>
        <div class="portal-links">
          <a href="https://www.realestate.co.nz/residential/rent/auckland/north-shore-city/belmont" target="_blank" rel="noopener">Realestate(Belmont) ↗</a>
          <a href="https://www.realestate.co.nz/residential/rent/auckland/north-shore-city/takapuna" target="_blank" rel="noopener">Realestate(Takapuna) ↗</a>
          <a href="https://www.barfoot.co.nz/properties/rental/region=north-shore-city/suburb=belmont,bayswater,hauraki,narrow-neck,takapuna,devonport" target="_blank" rel="noopener">Barfoot 노스쇼어 통합 ↗</a>
          <a href="https://www.myrent.co.nz/listings?suburb=Belmont" target="_blank" rel="noopener">myRent 직거래 ↗</a>
          <a href="https://www.oneroof.co.nz/search/for-rent/suburb_belmont-north-shore-city-2513_bayswater-north-shore-city-2277_hauraki-north-shore-city-2191" target="_blank" rel="noopener">OneRoof 면적·시세 ↗</a>
        </div>
      </div>
      <details class="criteria-box">
        <summary>👑 원픽(207/28 Killarney St · 주 NZ$750 / 80㎡·24.2평) 대비 5대 비교 기준</summary>
        <ol>
          <li><b>실질 월 비용</b>: 원픽 주 NZ$750(약 ${topPickWeekly.man}만 원 · 월 NZ$3,250 / 약 ${topPickMonthly.man}만 원) · 유학원 샘플01(주 NZ$850) 대비 매주 NZ$100(약 7.4만 원) 절감</li>
          <li><b>전용면적(㎡·평수) 대비 가성비</b>: 원픽은 80㎡(약 24.2평·침실2·욕실2·2층 보안층)이며, 더 넓은 마당·침실3~4가 필요할 경우 100~207㎡(약 30.3~62.6평) 매물과 비교</li>
          <li><b>통학 및 Westgate 동선</b>: 원픽(타카푸나 호수공원 앞 · 학교 차량 6분 · SH1/SH18 고속도로 진입 2분) vs 벨몬트 권역1(학교 도보 5~15분)</li>
          <li><b>계약 조건</b>: 원픽 입주일(12/29)을 기준으로 12월 중순~하순 입주 매물(12/7, 12/9, 12/13, 12/16, 12/17, 12/18, 12/19, 12/23) 상시 추적</li>
          <li><b>로드뷰 현장 검증</b>: 아파트 출입 보안, 층수(2층 이상 선호), 공원·상권 도보 동선 및 주차 편의성 확인</li>
        </ol>
      </details>
    </section>
    <div class="housing-toolbar"><b>현재 공고 매물 (${filtered.length}건)</b><div><button data-filter="all" class="${filter==='all'?'active':''}">전체</button><button data-filter="saved" class="${filter==='saved'?'active':''}">관심 ★</button></div></div>
    <label class="source-filter">핀 색상·권역별 보기<select aria-label="매물 출처" id="housing-source">
      <option value="all" ${sourceFilter==='all'?'selected':''}>전체 현재 공고 (${homes.length})</option>
      <option value="toppick" ${sourceFilter==='toppick'?'selected':''}>👑 정이사님 원픽 1순위 · 황금 핀 '★' (1)</option>
      <option value="belmont2" ${sourceFilter==='belmont2'?'selected':''}>🩵 벨몬트 2차 알짜 · 하늘색 핀 '벨' (${b2Count})</option>
      <option value="edusky" ${sourceFilter==='edusky'?'selected':''}>🩷 유학원 샘플01 · 분홍 핀 '유' (1)</option>
      <option value="zone1" ${sourceFilter==='zone1'?'selected':''}>🔵 권역1 1차 (벨몬트·베이스워터) · 파란 핀 '1' (${z1Count})</option>
      <option value="takapuna" ${sourceFilter==='takapuna'?'selected':''}>🟣 타카푸나 상권·해변권 · 보라 핀 '타' (${takaCount})</option>
      <option value="zone2a" ${sourceFilter==='zone2a'?'selected':''}>🟠 권역2-A 하우라키 실속권 · 주황 핀 '2' (${z2aCount})</option>
      <option value="zone2b" ${sourceFilter==='zone2b'?'selected':''}>🟠 권역2-B 데본포트·내로우넥 · 주황 핀 '2' (${z2bCount})</option>
    </select></label><div class="housing-list">${filtered.map(h=>{
      const d=distance(h),dm=d===null?'좌표 확인 중':`학교 중심까지 직선 ${d<1000?Math.round(d)+'m':(d/1000).toFixed(2)+'km'}`;
      const weekly=Number(h.weeklyRent),monthly=Math.round(weekly*52/12);
      const wKrw = toKrwMan(weekly), mKrw = toKrwMan(monthly);
      const diff = weekly - 750;
      const diffKrw = toKrwMan(Math.abs(diff));
      const diffText = h.isTopPick ? '👑 정이사님 원픽 1순위 기준점' : (diff < 0 ? `원픽(NZ$750) 대비 주 -NZ$${Math.abs(diff)} (-약 ${diffKrw.man}만 원)` : diff === 0 ? '원픽(NZ$750)과 주세 동일' : `원픽(NZ$750) 대비 주 +NZ$${diff} (+약 ${diffKrw.man}만 원)`);
      const areaLabel = toAreaPyeong(h);
      const badgeClass = h.isTopPick ? 'toppick-card' : h.sourceType === 'edusky' ? 'agency-card' : h.sourceType === 'belmont2' ? 'belmont2-card' : h.sourceType === 'zone1' ? 'zone1-card' : h.sourceType === 'takapuna' ? 'taka-card' : 'zone2-card';
      const pinBadge = h.isTopPick ? '👑 원픽 1순위 [★]' : h.sourceType === 'edusky' ? '🩷 유학원샘플 [유]' : h.sourceType === 'belmont2' ? '🩵 하늘색핀 [벨]' : h.sourceType === 'zone1' ? '🔵 파란핀 [1]' : h.sourceType === 'takapuna' ? '🟣 보라핀 [타]' : '🟠 주황핀 [2]';
      return `<article class="home-card ${badgeClass} ${selected===h.id?'selected':''}"><div class="home-top"><span class="home-status current">${pinBadge} · 현재 공고</span><button class="save-home" data-save="${esc(h.id)}" aria-label="${esc(h.title)} 관심 후보 ${saved.has(h.id)?'해제':'저장'}" aria-pressed="${saved.has(h.id)}">${saved.has(h.id)?'★':'☆'}</button></div><p class="home-source">${esc(h.sourceLabel)}</p><button class="home-name" data-focus="${esc(h.id)}">${esc(h.title)}</button><div class="home-price">NZ$${weekly.toLocaleString()} <span class="krw-inline">(약 ${wKrw.man}만 원 · ₩${wKrw.krw.toLocaleString()})</span><small> / 주</small></div><div class="home-diff ${diff<0?'save':'more'}">${esc(diffText)}</div><div class="home-month">월 환산 <b>NZ$${monthly.toLocaleString()} (약 ${mKrw.man}만 원 · ₩${mKrw.krw.toLocaleString()})</b> · 주세×52÷12</div><div class="home-facts"><span class="area-badge">📐 ${esc(areaLabel)}</span><span>침실 ${esc(h.bedrooms)}</span>${h.bathrooms?`<span>욕실 ${esc(h.bathrooms)}</span>`:''}${h.parking!==undefined?`<span>주차 ${esc(h.parking)}</span>`:''}<span>${esc(h.areaNote||'')}</span></div><p class="home-distance">${dm} ${h.areaSource?`· <small>${esc(h.areaSource)}</small>`:''}</p>${h.walking?`<p class="home-walk">도보 ${esc(h.walking.distance)} · 약 ${esc(h.walking.minutes)}분<small>Google 지도 · ${esc(h.walking.verifiedAt)} 확인</small></p>`:''}<p class="home-review">${esc(h.reviewStatus)}</p>${h.locationNote?`<p class="home-location">${esc(h.locationNote)}</p>`:''}<div class="home-actions"><button data-focus="${esc(h.id)}">3D 핀 이동</button><button data-sv="${esc(h.id)}" class="btn-sv">로드뷰 보기</button><a href="${esc(h.url)}" target="_blank" rel="noopener">원문 ↗</a><a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(h.title+', Auckland, New Zealand')}&destination=${encodeURIComponent('Belmont Primary School, 3A Harrison Avenue, Auckland')}&travelmode=driving" target="_blank" rel="noopener">차량 경로 ↗</a><a href="https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(h.title+', Auckland, New Zealand')}&destination=${encodeURIComponent('Belmont Primary School, 3A Harrison Avenue, Auckland')}&travelmode=walking" target="_blank" rel="noopener">도보 경로 ↗</a></div></article>`;
    }).join('')||'<p class="housing-empty">선택한 조건에 맞는 후보가 없습니다.</p>'}</div>
    <footer class="housing-foot">자료 업데이트 2026.11.15 · 현재 공고 28건 (벨몬트·베이스워터 10 + 타카푸나 11 + 하우라키 3 + 데본포트 3 + 유학원 1)<br>환율 기준 1 NZ$ ≈ ₩${rate} · 평수 환산 1평 = 3.3058㎡</footer>`;
    aside.querySelector('.housing-close').onclick=()=>setOpen(false);
    aside.querySelector('#housing-source').onchange=e=>{sourceFilter=e.target.value;render();};
    aside.querySelector('[data-westgate]').onclick=()=>focus('nz-westgate');
    aside.querySelector('[data-nz-overview]').onclick=()=>window.dispatchEvent(new CustomEvent('eh-nz-overview'));
    aside.querySelector('[data-school]').onclick=()=>focus('nz-school');
    aside.querySelector('[data-school-sv]').onclick=()=>openSV('nz-school');
    aside.querySelectorAll('[data-focus]').forEach(b=>b.onclick=()=>focus(b.dataset.focus));
    aside.querySelectorAll('[data-sv]').forEach(b=>b.onclick=()=>openSV(b.dataset.sv));
    aside.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{filter=b.dataset.filter;render();});
    aside.querySelectorAll('[data-save]').forEach(b=>b.onclick=()=>{const id=b.dataset.save;saved.has(id)?saved.delete(id):saved.add(id);try{localStorage.setItem('eh-nz-homes-v2',JSON.stringify([...saved]));}catch{}render();});
  }
  window.addEventListener('eh-place-focused',e=>{confirmedPlace=e.detail;pendingPlace=null;selected=e.detail;render();});
  window.addEventListener('eh-map-ready',()=>{if(pendingPlace)window.dispatchEvent(new CustomEvent('eh-focus-place',{detail:pendingPlace}));});
  window.addEventListener('eh-place-selected',e=>{if(e.detail==='nz-school'||homes.some(h=>h.id===e.detail)){selected=e.detail;render();}});
  render();
})();
