// 뉴질랜드 주거 검토 전용 좌표 데이터 (2026-11-15 · 현재 공고 28건 · 한화 및 ㎡/평수 병기 완료)
const rateKrw = window.NZD_TO_KRW || 739;
const fmtNzdKrw = nzd => {
  const krw = Math.round(nzd * rateKrw);
  const man = (krw / 10000).toFixed(1).replace(/\.0$/, '');
  return `NZ$${nzd.toLocaleString()} (약 ${man}만 원 · ₩${krw.toLocaleString()})`;
};
const fmtAreaPyeong = h => {
  if (Number.isFinite(h.area)) {
    const py = (h.area / 3.305785).toFixed(1);
    return `${h.area}㎡ (약 ${py}평)`;
  }
  return h.areaEstimate || '면적 미표기 (평수 미상)';
};

const nzBasePlaces = [
  {
    id: 'nz-school',
    type: 'school',
    region: 'nz',
    glyph: '학',
    color: '#2f9e44',
    name: '벨몬트 프라이머리 · 주거 검토 기준점',
    lng: 174.7918802,
    lat: -36.8065311,
    info: {
      주소: '3A Harrison Avenue, Belmont, Auckland 0622, New Zealand',
      용도: '뉴질랜드 주거 검토 기준점 (국제학생 공식 학군 제한 무관)',
      위치: '학교 부지 중심 · 정문·보행 경로는 로드뷰로 즉시 확인 가능',
      출처: '<a href="https://www.belmont.school.nz/contact-us/" target="_blank" rel="noopener">학교 공식 안내</a> · OpenStreetMap 좌표'
    }
  },
  {
    id: 'nz-westgate',
    type: 'area',
    region: 'nz',
    glyph: '가',
    color: '#0b7285',
    name: '웨스트게이트 · 가족 거주 지역',
    lat: -36.82136717994411,
    lng: 174.61018361529048,
    info: {
      지역: 'Westgate, Auckland · 오클랜드 북서부',
      가족연결: '아내분 사촌동생 거주 지역 (정이사님 안내)',
      표시기준: 'Westgate Shopping Centre 공식 안내지도 중심 (실제 거주지 주소 아님)',
      자동차이동: '학교→Westgate쇼핑센터 23.7km·약 21분 (SH18 경유)',
      출처: '<a href="https://westgate.kiwi/visitor-info/" target="_blank" rel="noopener">웨스트게이트 공식 위치 안내</a>'
    }
  }
];

const nzPlaces = [
  ...nzBasePlaces,
  ...(window.NZ_HOMES || []).filter(h => h.currentListing && Number.isFinite(h.lat) && Number.isFinite(h.lng)).map(h => {
    const isTopPick = Boolean(h.isTopPick);
    const isEdusky = h.sourceType === 'edusky';
    const isBelmont2 = h.sourceType === 'belmont2';
    const isZone1 = h.sourceType === 'zone1';
    const isTakapuna = h.sourceType === 'takapuna';
    const color = isTopPick ? '#e67700' : isEdusky ? '#d6336c' : isBelmont2 ? '#00b4d8' : isZone1 ? '#1971c2' : isTakapuna ? '#7048e8' : '#e8590c';
    const glyph = isTopPick ? '★' : isEdusky ? '유' : isBelmont2 ? '벨' : isZone1 ? '1' : isTakapuna ? '타' : '2';
    const monthlyNzd = Math.round(h.weeklyRent * 52 / 12);
    const diff = h.weeklyRent - 750;
    const diffKrwMan = Math.round(Math.abs(diff) * rateKrw / 1000) / 10;
    const diffStr = h.isTopPick ? '👑 정이사님 원픽 1순위 기준점 (주 NZ$750 · 약 55.4만 원)' : (diff < 0 ? `원픽(NZ$750) 대비 주 -NZ$${Math.abs(diff)} (-약 ${diffKrwMan}만 원)` : diff === 0 ? '원픽(NZ$750)과 주세 동일' : `원픽(NZ$750) 대비 주 +NZ$${diff} (+약 ${diffKrwMan}만 원)`);
    const areaStr = fmtAreaPyeong(h);
    return {
      id: h.id,
      type: 'home',
      sourceType: h.sourceType,
      region: 'nz',
      glyph,
      color,
      name: `${h.title} · ${areaStr}`,
      lat: h.lat,
      lng: h.lng,
      info: {
        구분: h.sourceLabel,
        주당임대료: `<b>${fmtNzdKrw(h.weeklyRent)} / 주</b><br><span style="color:#0f766e;font-weight:700">${diffStr}</span>`,
        월환산임대료: `${fmtNzdKrw(monthlyNzd)} / 월`,
        전용면적: `<b>${areaStr}</b> <small style="color:#64748b">(${h.areaSource || ''})</small>`,
        구조: `침실 ${h.bedrooms} · 욕실 ${h.bathrooms || 1} · 주차 ${h.parking ?? '미상'} (${h.areaNote || ''})`,
        입주및조건: h.reviewStatus,
        원문링크: `<a href="${h.url}" target="_blank" rel="noopener">매물 공고 원문 열기 ↗</a>`
      }
    };
  })
];
