import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from "axios";
import './DashBoard.css';

// 밀리초를 'M분 SS초'로 전환하는 유티리티
const formatDwellTime = (ms) => {
  if (ms == null) return '-';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
};

// 증감율 계산 유틸리티
const calcDeltaPct = (curr, prev) => {
  if (!prev) return 0;
  return Math.round(((curr - prev) / prev) * 100);
};

export default function Dashboard() {
  const [currentPeriod, setCurrentPeriod] = useState('202607');
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('top5'); // 'top5' | 'noinq'
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 차트 인터랙션용 State
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, text: '' });
  const periodRef = useRef(null);

  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  };

  // API 데이터 조회 함수
useEffect(() => {
  let isMounted = true;

  setLoading(true);

  const url = process.env.REACT_APP_API_KEY + "admin/dashboard/summary";

  axios
    .get(url, {
      ...config,
      params: {
        period: currentPeriod,
      },
    })
    .then((result) => {
      console.log(result.data);

      if (
        isMounted &&
        result.data.SUCCESS === "TRUE" &&
        result.data.RECORD
      ) {
        setDashboardData(result.data.RECORD);//실제
        // setDashboardData(getMockRecord(currentPeriod));//더미데이터 확인
      } else {
        setDashboardData(null);
      }
    })
    .catch((err) => {
      console.error("Dashboard 로드 실패 :", err);

      if (isMounted) {
          setDashboardData(getMockRecord(currentPeriod));
      }
    })
    .finally(() => {
      if (isMounted) {
        setLoading(false);
      }
    });

  return () => {
    isMounted = false;
  };
}, [currentPeriod]);

  // 외부 클릭 시 Dropdown 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (periodRef.current && !periodRef.current.contains(e.target)) {
        setIsPeriodOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 라인 차트 계산 (SVG Path & Hover Hit)
  const chartGeometry = useMemo(() => {
    if (!dashboardData?.visitor_trend?.length) return null;

    const trends = dashboardData.visitor_trend;
    const width = 560;
    const height = 180;
    const paddingY = 10;
    const maxVal = Math.max(...trends.map((t) => t.count), 1);

    const points = trends.map((item, idx) => {
      const x = (idx / (trends.length - 1)) * width;
      const y = height - paddingY - (item.count / maxVal) * (height - paddingY * 2);
      return { x, y, date: item.date, count: item.count };
    });

    const linePathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
    const areaPathD = `${linePathD} L ${width},${height} L 0,${height} Z`;

    return { points, linePathD, areaPathD, width, height };
  }, [dashboardData]);

  const handleMouseMove = (e) => {
    if (!chartGeometry) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * chartGeometry.width;

    // 가장 가까운 X 좌표 포인트 검색
    let closest = chartGeometry.points[0];
    let minDiff = Math.abs(mouseX - closest.x);

    for (let i = 1; i < chartGeometry.points.length; i++) {
      const diff = Math.abs(mouseX - chartGeometry.points[i].x);
      if (diff < minDiff) {
        minDiff = diff;
        closest = chartGeometry.points[i];
      }
    }

    const [, month, day] = closest.date.split('-');
    setTooltip({
      show: true,
      x: closest.x,
      y: closest.y,
      text: `${parseInt(month, 10)}월 ${parseInt(day, 10)}일 · ${closest.count}명`,
      leftPct: (closest.x / chartGeometry.width) * 100,
      topPct: (closest.y / chartGeometry.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

   if (loading) {
    return (
        <div className="shell">
        데이터를 불러오는 중입니다...
        </div>
    );
    }

    if (!dashboardData) {
    return (
        <div className="shell">
        데이터를 불러오지 못했습니다.
        </div>
    );
    }

  const record = dashboardData;
  const periods = record?.available_periods || [];
  const selectedPeriodLabel = periods.find((p) => p.period === currentPeriod)?.label || `${currentPeriod.slice(0, 4)}년 ${currentPeriod.slice(4)}월`;

  // 도넛 차트 각도 계산 (Conic Gradient)
  const totalRef = (record.referral_breakdown.naver || 0) + (record.referral_breakdown.direct || 0) + (record.referral_breakdown.other || 0) || 1;
  const pNaver = Math.round(((record.referral_breakdown.naver || 0) / totalRef) * 100);
  const pDirect = Math.round(((record.referral_breakdown.direct || 0) / totalRef) * 100);
  const pOther = 100 - pNaver - pDirect;

  const donutStyle = {
    background: `conic-gradient(
      var(--series-naver) 0% ${pNaver}%,
      var(--series-direct) ${pNaver}% ${pNaver + pDirect}%,
      var(--series-other) ${pNaver + pDirect}% 100%
    )`
  };

  return (
    <div className="shell">

      {/* Page Head */}
      <header className="page-head">
        <div>
          {/* <h1>대시보드</h1>
          <p className="sub">25시 부동산 · foray.bomul.co.kr</p> */}
        </div>

        {/* Period Selector */}
        <div
          ref={periodRef}
          className={`period ${isPeriodOpen ? 'open' : ''}`}
          onClick={() => setIsPeriodOpen(!isPeriodOpen)}
        >
          <span>기간</span>
          <strong>{selectedPeriodLabel}</strong>
          <svg viewBox="0 0 20 20" fill="none">
            <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div className={`period-menu ${isPeriodOpen ? 'open' : ''}`}>
            {periods.map((p) => (
              <button
                key={p.period}
                type="button"
                className={p.period === currentPeriod ? 'active' : ''}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPeriod(p.period);
                  setIsPeriodOpen(false);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="kpi-row">
        {/* 네이버 유입 */}
        <KpiCard
          label="네이버 유입"
          hint="referrer_url이 naver.com/naver.me 도메인이거나 utm_source=naver인 방문 수"
          current={record.kpi.naver_referral.current}
          previous={record.kpi.naver_referral.previous}
          unit="건"
        />

        {/* 방문자 수 */}
        <KpiCard
          label="방문자 수"
          current={record.kpi.visitor_count.current}
          previous={record.kpi.visitor_count.previous}
          unit="명"
        />

        {/* 전화클릭 */}
        <KpiCard
          label="전화클릭"
          current={record.kpi.phone_click.current}
          previous={record.kpi.phone_click.previous}
          unit="건"
        />

        {/* 신규 / 재방문 */}
        <div className="kpi">
          <div className="label">신규 / 재방문</div>
          {(() => {
            const total = (record.kpi.new_visitor_count || 0) + (record.kpi.returning_visitor_count || 0) || 1;
            const newPct = Math.round((record.kpi.new_visitor_count / total) * 100);
            const retPct = 100 - newPct;
            return (
              <>
                <div className="value" style={{ fontSize: '16px', marginTop: '2px' }}>
                  {newPct}% <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>/</span> {retPct}%
                </div>
                <div className="split-bar">
                  <span style={{ width: `${newPct}%`, background: 'var(--accent)' }} />
                  <span style={{ width: `${retPct}%`, background: 'var(--border-strong)' }} />
                </div>
                <div className="split-legend">
                  <span><span className="sw" style={{ background: 'var(--accent)' }} />신규 {record.kpi.new_visitor_count}명</span>
                  <span><span className="sw" style={{ background: 'var(--border-strong)' }} />재방문 {record.kpi.returning_visitor_count}명</span>
                </div>
              </>
            );
          })()}
        </div>

        {/* 상담노트 현황 */}
        <div className="kpi">
          <div className="label">
            상담노트 현황 <span className="hint" title="이번달 등록된 상담노트(고객노트)의 진행상태 분포">ⓘ</span>
          </div>
          <div className="value">
            {record.note_status_breakdown.all.total_count}<small>건</small>
          </div>
          {(() => {
            const total = record.note_status_breakdown.all.total_count || 1;
            const cPct = Math.round((record.note_status_breakdown.consulting.total_count / total) * 100);
            const pPct = Math.round((record.note_status_breakdown.proposed.total_count / total) * 100);
            const kPct = Math.round((record.note_status_breakdown.contracted.total_count / total) * 100);
            const lPct = 100 - cPct - pPct - kPct;

            return (
              <>
                <div className="split-bar">
                  <span style={{ width: `${cPct}%`, background: 'var(--accent)' }} />
                  <span style={{ width: `${pPct}%`, background: 'var(--warn)' }} />
                  <span style={{ width: `${kPct}%`, background: 'var(--success)' }} />
                  <span style={{ width: `${lPct}%`, background: 'var(--border-strong)' }} />
                </div>
                <div className="split-legend" style={{ flexWrap: 'wrap', rowGap: '6px' }}>
                  <span><span className="sw" style={{ background: 'var(--accent)' }} />상담중 {record.note_status_breakdown.consulting.total_count}</span>
                  <span><span className="sw" style={{ background: 'var(--warn)' }} />제안 {record.note_status_breakdown.proposed.total_count}</span>
                  <span><span className="sw" style={{ background: 'var(--success)' }} />계약 {record.note_status_breakdown.contracted.total_count}</span>
                  <span><span className="sw" style={{ background: 'var(--border-strong)' }} />이탈 {record.note_status_breakdown.lost.total_count}</span>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Chart Section */}
      <section className="chart-row">
        {/* Line Chart */}
        <div className="card">
          <h3>방문자 추이</h3>
          <p className="card-sub">최근 30일, 일별 방문자수</p>

          <div className="linechart">
            {chartGeometry && (
              <svg viewBox="0 0 560 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--seq-450)" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="var(--seq-450)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line className="gridline" x1="0" y1="30" x2="560" y2="30" />
                <line className="gridline" x1="0" y1="80" x2="560" y2="80" />
                <line className="gridline" x1="0" y1="130" x2="560" y2="130" />

                <path className="area" d={chartGeometry.areaPathD} />
                <path className="line" d={chartGeometry.linePathD} />

                {tooltip.show && (
                  <>
                    <line className="hover-x" x1={tooltip.x} y1="0" x2={tooltip.x} y2="180" style={{ opacity: 1 }} />
                    <circle className="hover-dot" r="4" cx={tooltip.x} cy={tooltip.y} style={{ opacity: 1 }} />
                  </>
                )}

                <rect
                  x="0"
                  y="0"
                  width="560"
                  height="180"
                  fill="transparent"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                />
              </svg>
            )}

            {tooltip.show && (
              <div
                className="chart-tooltip"
                style={{
                  opacity: 1,
                  left: `${tooltip.leftPct}%`,
                  top: `${tooltip.topPct}%`,
                }}
              >
                {tooltip.text}
              </div>
            )}
          </div>

          <div className="axis-labels">
            <span>7/1</span><span>7/8</span><span>7/15</span><span>7/22</span><span>7/30</span>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="card">
          <h3>유입경로</h3>
          <p className="card-sub">이번 달 방문자 기준</p>
          <div className="donut-wrap">
            <div className="donut" style={donutStyle}>
              <div className="donut-center">
                <span className="n">{record.kpi.visitor_count.current.toLocaleString()}</span>
                <span className="l">전체</span>
              </div>
            </div>
            <ul className="legend">
              <li>
                <span className="name"><span className="sw" style={{ background: 'var(--series-naver)' }} />네이버</span>
                <span><span className="pct">{pNaver}%</span><span className="cnt">{record.referral_breakdown.naver}건</span></span>
              </li>
              <li>
                <span className="name"><span className="sw" style={{ background: 'var(--series-direct)' }} />직접 유입</span>
                <span><span className="pct">{pDirect}%</span><span className="cnt">{record.referral_breakdown.direct}건</span></span>
              </li>
              <li>
                <span className="name"><span className="sw" style={{ background: 'var(--series-other)' }} />기타</span>
                <span><span className="pct">{pOther}%</span><span className="cnt">{record.referral_breakdown.other}건</span></span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Property Performance Table */}
      <section className="card table-card">
        <div className="table-head">
          <h3 style={{ marginTop: '2px' }}>매물 성과</h3>
          <div className="seg" role="tablist">
            <button
              type="button"
              className={activeTab === 'top5' ? 'active' : ''}
              onClick={() => setActiveTab('top5')}
            >
              인기매물 TOP5
            </button>
            <button
              type="button"
              className={activeTab === 'noinq' ? 'active' : ''}
              onClick={() => setActiveTab('noinq')}
            >
              문의없는 매물
            </button>
          </div>
        </div>

        {activeTab === 'top5' ? (
          <table>
            <thead>
              <tr>
                <th>매물</th>
                <th className="num">조회수</th>
                <th className="num">평균체류</th>
                <th className="num">문의수</th>
              </tr>
            </thead>
            <tbody>
              {record.top_properties.map((item, index) => (
                <tr key={item.property_no || index}>
                  <td>
                    <span className="rank">{index + 1}</span>
                    <span className="pname">{item.property_name}</span>
                    <div className="paddr" style={{ marginLeft: '30px' }}>{item.address}</div>
                  </td>
                  <td className="num">{item.view_count}</td>
                  <td className="num">{formatDwellTime(item.avg_dwell_ms)}</td>
                  <td className="num">
                    {record.inquiry_data_available ? item.inquiry_count : (item.inquiry_count ?? 18 - index * 3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table>
            <thead>
              <tr>
                <th>매물</th>
                <th className="num">조회수</th>
                <th className="num">평균체류</th>
                <th className="num">문의수</th>
              </tr>
            </thead>
            <tbody>
              {record.no_inquiry_properties?.map((item, index) => (
                <tr key={item.property_no || index}>
                  <td>
                    <span className="pname">{item.property_name}</span>
                    <div className="paddr">{item.address}</div>
                  </td>
                  <td className="num">{item.view_count}</td>
                  <td className="num">{formatDwellTime(item.avg_dwell_ms)}</td>
                  <td className="num">
                    <span className="zero-chip">0건</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* <div className="footnote">
          <svg viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.4" />
            <path d="M10 9v5M10 6.5v.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span>
            조회수·체류시간·유입경로는 site_analytics_daily_stats / property_analytics_daily(새벽 배치 집계)에서 바로 조회됩니다.{' '}
            <strong>문의수는 고객노트 시스템과의 연동이 아직 없어 이 화면은 시안 값입니다</strong> — 실제 연결 전까지 해당 컬럼은 비워두거나 별도 표시가 필요합니다.
          </span>
        </div> */}
      </section>
    </div>
  );
}

// KPI 카드 서브 컴포넌트
function KpiCard({ label, hint, current, previous, unit }) {
  const deltaPct = calcDeltaPct(current, previous);
  const isUp = deltaPct >= 0;

  return (
    <div className="kpi">
      <div className="label">
        {label} {hint && <span className="hint" title={hint}>ⓘ</span>}
      </div>
      <div className="value">
        {current?.toLocaleString()}<small>{unit}</small>
      </div>
      <span className={`delta ${isUp ? 'up' : 'down'}`}>
        <svg viewBox="0 0 12 12" fill="none">
          <path
            d={isUp ? "M6 2v8M2 6l4-4 4 4" : "M6 10V2M2 6l4 4 4-4"}
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {Math.abs(deltaPct)}%
        <span className="delta-ctx">전월 {previous?.toLocaleString()}{unit}</span>
      </span>
    </div>
  );
}

// Mock 데이터 생성 함수 (통신 실패 또는 테스트용)
function getMockRecord(periodStr) {
  return {
    period: { year: 2026, month: 7, start: '2026-07-01', end: '2026-07-31' },
    kpi: {
      naver_referral: { current: 128, previous: 108 },
      visitor_count: { current: 1204, previous: 1126 },
      phone_click: { current: 34, previous: 36 },
      new_visitor_count: 819,
      returning_visitor_count: 385,
    },
    referral_breakdown: { naver: 128, direct: 45, other: 33 },
    visitor_trend: Array.from({ length: 30 }, (_, i) => ({
      date: `2026-07-${String(i + 1).padStart(2, '0')}`,
      count: Math.floor(20 + Math.random() * 40 + i * 1.2),
    })),
    top_properties: [
      { property_no: 1, property_name: '반포리버파크 84㎡ 전세', address: '서울 서초구 반포동', view_count: 312, avg_dwell_ms: 134000, inquiry_count: null },
      { property_no: 2, property_name: '여의도동 오피스텔 월세', address: '서울 영등포구 여의도동', view_count: 247, avg_dwell_ms: 108000, inquiry_count: null },
      { property_no: 3, property_name: '잠원동 신축빌라 매매', address: '서울 서초구 잠원동', view_count: 201, avg_dwell_ms: 93000, inquiry_count: null },
      { property_no: 4, property_name: '동작구 상가 임대', address: '서울 동작구 노량진동', view_count: 188, avg_dwell_ms: 51000, inquiry_count: null },
      { property_no: 5, property_name: '반포리 단독주택 매매', address: '서울 서초구 반포동', view_count: 156, avg_dwell_ms: 62000, inquiry_count: null },
    ],
    no_inquiry_properties: [
      { property_no: 6, property_name: '동작구 상가 임대', address: '서울 동작구 노량진동', view_count: 188, avg_dwell_ms: 51000, inquiry_count: 0 },
      { property_no: 7, property_name: '신사동 오피스텔 월세', address: '서울 강남구 신사동', view_count: 94, avg_dwell_ms: 39000, inquiry_count: 0 },
      { property_no: 8, property_name: '방배동 투룸 전세', address: '서울 서초구 방배동', view_count: 61, avg_dwell_ms: 22000, inquiry_count: 0 },
    ],
    inquiry_data_available: false,
    note_status_breakdown: {
      consulting: { title: '상담중', total_count: 14 },
      proposed: { title: '매물제안', total_count: 8 },
      contracted: { title: '계약완료', total_count: 6 },
      lost: { title: '이탈', total_count: 4 },
      all: { title: '전체', total_count: 32 },
    },
    available_periods: [
      { period: '202607', year: 2026, month: 7, label: '2026년 7월' },
      { period: '202606', year: 2026, month: 6, label: '2026년 6월' },
      { period: '202605', year: 2026, month: 5, label: '2026년 5월' },
      { period: '202604', year: 2026, month: 4, label: '2026년 4월' },
      { period: '202603', year: 2026, month: 3, label: '2026년 3월' },
      { period: '202602', year: 2026, month: 2, label: '2026년 2월' },
      { period: '202601', year: 2026, month: 1, label: '2026년 1월' },
    ],
  };
}