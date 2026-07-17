import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { now_property_view } from '../../store'; // store에서 가져오기
import axios from "axios";
import $ from "jquery";

function chunk(params = [], size = 1) {
  const arr = [];
    
  for (let i = 0; i < params.length; i += size) {
    arr.push(params.slice(i, i + size));
  }

  return arr;
}

// 가격 포맷팅 유틸리티 (예: 150000 -> 15억, 8500 -> 8500만)
const formatPrice = (price) => {
  if (!price) return '0';
  const numPrice = Number(price);
  if (numPrice >= 10000) {
    const uk = Math.floor(numPrice / 10000);
    const rest = numPrice % 10000;
    return rest > 0 ? `${uk}억 ${rest}만` : `${uk}억`;
  }
  return `${numPrice}만`;
};

// 매물 방식 및 최종 가격 조합 함수
const getPropertyTypeAndPrice = (row) => {
  let type = '-';
  let typeClass = ''; // CSS 대응용 영어 클래스명
  let priceText = '-';

  if (row.sale_price && Number(row.sale_price) > 0) {
    type = '매매';
    typeClass = 'sale';
    priceText = formatPrice(row.sale_price);
  } else if (row.jeonse_price && Number(row.jeonse_price) > 0) {
    type = '전세';
    typeClass = 'jeonse';
    priceText = formatPrice(row.jeonse_price);
  } else if (row.monthly_rent && Number(row.monthly_rent) > 0) {
    type = '월세';
    typeClass = 'rent';
    const deposit = row.deposit_price ? formatPrice(row.deposit_price).replace('만', '') : '0';
    const rent = row.monthly_rent;
    priceText = `${deposit}/${rent}`;
  }

  return { type, typeClass, price: priceText };
};

function Property_brd_all(props){
  
  let data = props.data;
  let origin = props.origin_data;
  let [now_data, setNow_data] = useState();
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

  // 💡 검색 조건을 관리할 State 5종 세트 정의
  let [propertyType, setPropertyType] = useState('all');    // 매물종류 (아파트, 오피스텔 등)
  let [tradeType, setTradeType] = useState('all');          // 거래방식 (매매, 전세, 월세)
  let [tradeStatus, setTradeStatus] = useState('all');      // 거래상태 (1~5)
  let [regionTxt, setRegionTxt] = useState('');         // 지역 검색어 (시군구 + 동)
  let [propertyNameTxt, setPropertyNameTxt] = useState(''); // 매물명 검색어
  let [searchTxt, setSearchTxt] = useState('');             // 검색어

  console.log(data);
  console.log(origin);

  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  let page = [];
  for(let i = 0; i < origin.pager.total_page; i++){
    page.push('');
  }

  useEffect(()=>{
    setNow_data(data);
    setNow_page(1);
  }, [data]);

  // 💡 검색 함수: 검색 버튼을 누르거나 페이지를 이동할 때 호출됩니다.
  const handleSearch = (targetPage = 1) => {
    // 기본 주소 조립 (페이지 번호와 탭 카테고리값 포함)
    let url = `${process.env.REACT_APP_API_KEY}Admin/Property/list?limit=8&page=${targetPage}&code=${props.whats}`;

    // 1. 매물종류 필터링 파라미터 추가
    if (propertyType !== 'all') {
      url += `&category=${propertyType}`;
    }
    // 2. 거래방식 필터링 파라미터 추가
    if (tradeType !== 'all') {
      url += `&trade_type=${tradeType}`;
    }
    // 3. 거래상태 필터링 파라미터 추가
    if (tradeStatus !== 'all') {
      url += `&status=${tradeStatus}`;
    }

    // 💡 4. [변경됨] 지역 검색어가 있을 때 파라미터 추가
    if (regionTxt.trim() !== '') {
      url += `&region=${encodeURIComponent(regionTxt)}`;
    }

    // 💡 5. [변경됨] 매물명 검색어가 있을 때 파라미터 추가
    if (propertyNameTxt.trim() !== '') {
      url += `&property_name=${encodeURIComponent(propertyNameTxt)}`;
    }

    axios.get(url, config).then((result)=>{
      console.log("필터 및 검색 결과:", result.data.RECORD.rows); 
      setNow_data(result.data.RECORD.rows); 
      setPage_info(result.data.RECORD.pager);
    });
  };

  // 💡 검색 및 필터 상태 전체 초기화 함수
  const handleReset = () => {
    // 1. 모든 상태(State)를 기본값으로 원상복구
    setPropertyType('all');
    setTradeType('all');
    setTradeStatus('all');
    setRegionTxt('');
    setPropertyNameTxt('');
    setNow_page(1);

    // 2. 초기화된 조건으로 첫 페이지 데이터 호출
    // (State 업데이트가 비동기이므로 직접 초기값을 인자로 넘겨서 요청하는 것이 안전합니다)
    let url = `${process.env.REACT_APP_API_KEY}Admin/Property/list?limit=8&page=1&code=${props.whats}`;
    
    axios.get(url, config).then((result) => {
      console.log("초기화 후 기본 데이터 로드:", result.data.RECORD.rows);
      setNow_data(result.data.RECORD.rows);
      setPage_info(result.data.RECORD.pager);
    }).catch((err) => {
      console.error("초기화 데이터 요청 실패:", err);
    });
  };

  // 페이지 이동 시 실시간 검색/페이징 연동
  useEffect(()=>{
    handleSearch(now_page);
  }, [now_page]);

  console.log(now_data, page, page_info)

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="fn_bar">
          <div className="search_con show">
            {/* 1. 매물종류 셀렉트 박스 */}
            <select 
              id="property_type"             
              name="property_type"
              aria-label="매물종류 필터 선택"
              value={propertyType} 
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="all">매물종류</option>
              <option value="apartment">아파트</option>
              <option value="officetel">오피스텔</option>
            </select>

            {/* 2. 거래방식 셀렉트 박스 */}
            <select 
              id="trade_type"                
              name="trade_type"
              aria-label="거래방식 필터 선택"
              value={tradeType} 
              onChange={(e) => setTradeType(e.target.value)}
            >
              <option value="all">거래방식</option>
              <option value="buy">매매</option>
              <option value="jeonse">전세</option>
              <option value="rent">월세</option>
            </select>

            {/* 3. 거래상태 셀렉트 박스 */}
            <select 
              id="status"              
              name="status"
              aria-label="거래상태 필터 선택"
              value={tradeStatus} 
              onChange={(e) => setTradeStatus(e.target.value)}
            >
              <option value="all">거래상태</option>
              <option value="1">거래가능</option>
              <option value="2">거래중</option>
              <option value="3">거래완료</option>
              <option value="4">거래보류</option>
              <option value="5">비공개</option>
            </select>

            {/* 4. 지역 입력란 */}
            <input 
              type="text" 
              id="region_search"             
              name="region_search"
              aria-label="지역 검색어 입력"
              placeholder="지역" 
              value={regionTxt} 
              onChange={(e) => setRegionTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />
            
            {/* 5. 매물명 입력란 */}
            <input 
              type="text" 
              id="property_name"           
              name="property_name"
              aria-label="매물명 검색어 입력"
              placeholder="매물명" 
              value={propertyNameTxt} 
              onChange={(e) => setPropertyNameTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />

            {/* 검색 버튼 */}
            <div className="btn_search" onClick={() => { setNow_page(1); handleSearch(1); }}>
              <span>검색</span>
            </div>
            
            {/* 초기화 버튼 */}
            <div className="btn_reset" onClick={handleReset} style={{ cursor: 'pointer' }}>
              <span>초기화</span>
            </div>
          </div>
          <div className="btn_new">
            <span><Link to="/property/write">매물 등록</Link></span>
          </div>
        </div>
        <div className="borad_rows">
          <div className="rows row0">
            <ul>
              <li className="board_no">글번호</li>
              <li className="board_trade_type">방식</li>
              <li className="board_property_type">종류</li>
              <li className="board_property_name board_title">매물명</li>
              <li className="board_sigungu">지역</li>
              <li className="board_price">가격</li>
              <li className="board_status">상태</li>
              <li className="board_display_yn">노출</li>
              <li className="board_hit">조회</li>
              <li className="board_date">등록일</li>
              <li className="board_etc">관리</li>
            </ul>
          </div>
          {
            now_data ? now_data.map(function(row, i){
              return(
                <Rows 
                  cfg={config} 
                  row={row} 
                  val={i} 
                  nowPage={now_page} 
                  page_data={page_info} 
                  key={row.property_no || i}
                />
              )
            }) : null
          }
        </div>
        <ul className='pagenation'>
          {page.map(function(a, i){
            return(
              <li className={now_page === i+1 ? 'on' : null} key={i} onClick={()=>{
                setNow_page(i+1);
              }}>
                <span>{i + 1}</span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

function Rows(props){

  let dispatch = useDispatch();
  let row = props.row;
  let index = props.val;
  let nowPage = props.nowPage;

  // 거래 방식, 배지 클래스명, 최종 가격 추출
  const { type, typeClass, price } = getPropertyTypeAndPrice(row);

  // 지역 주소 조합
  const fullAddress = `${row.addr_sigungu || ''} ${row.addr_dong || ''}`.trim() || '지역 정보 없음';

  // 상태 명세서
  const statusClassMap = {
    '1': 'possible',   // 거래가능
    '2': 'ing',        // 거래중
    '3': 'complete',   // 거래완료
    '4': 'pending',    // 거래보류
    '5': 'private'     // 비공개
  };

  // 2. 상태 명세서에 맞춘 한글 텍스트 매핑
  const statusTextMap = {
    '1': '거래가능',
    '2': '거래중',
    '3': '거래완료',
    '4': '거래보류',
    '5': '비공개'
  };

  // 기존에 String이나 Number 어떤 데이터타입으로 들어와도 유연하게 매칭되도록 String 변환 처리
  const statusKey = row.status ? String(row.status) : '1';
  const targetClass = statusClassMap[statusKey] || 'possible';
  const targetText = statusTextMap[statusKey] || '거래가능';

  // 2. 홈페이지 노출 여부 (display_yn: 1 또는 2) 매핑 정보
  const displayClassMap = {
    '1': 'display_y',  // 노출 (ON)
    '2': 'display_n'   // 숨김 (OFF)
  };

  const displayTextMap = {
    '1': 'ON',
    '2': 'OFF'
  };

  const displayKey = row.display_yn ? String(row.display_yn) : '1';
  const targetDisplayClass = displayClassMap[displayKey] || 'display_y';
  const targetDisplayText = displayTextMap[displayKey] || 'ON';
  return(
    <div className={"rows row"+(index+1)}>
      {/* 노출 여부가 N일 때 기존의 deleted 클래스를 타도록 동기화 */}
      <ul className={row.display_yn === "N" ? "deleted" : null}>
        <li className="board_no">{row.property_no}</li>
        <li className="board_trade_type">{type}</li> {/* 💡 row.type 대신 계산된 {type} (매매/전세/월세)이 노출되도록 개선했습니다. */}
        <li className="board_property_type">{row.category || '유형 없음'}</li>
        <li className="board_property_name board_title" 
        onClick={()=>{dispatch(now_property_view(row));}}><Link to={`/property/view?property_no=${row.property_no}`}>{row.property_name || '이름 없음'}</Link></li>
        <li className="board_sigungu">{fullAddress}</li>
        <li className="board_price">{price}</li>
        <li className="board_trade_status"><span className={`badge ${targetClass}`}>{targetText}</span></li>
        <li className="board_display_yn"><span className={`${targetDisplayClass}`}>{targetDisplayText}</span></li>
        <li className="board_hit">{row.view_count || 0}</li>
        <li className="board_date">{row.completion_date ? row.completion_date.substring(0, 10) : '-'}</li>
        <li className="board_etc">
          <div className="btns btn_edit">
            <span onClick={() => {
              dispatch(now_property_view(row));
            }}>
              <Link to={`/property/edit?property_no=${row.property_no}`}>수정</Link>
            </span>
          </div>
          <div className="btns btn_del">
            <span onClick={(()=>{
              let formData = new FormData();
              formData.append('property_no', row.property_no);
              if(window.confirm('삭제하시겠습니까?')){
                axios.post(process.env.REACT_APP_API_KEY+'Admin/Property/board_del', formData, props.cfg).catch(()=>{
                  alert("데이터 전송이 실패하였습니다.");
                }).then((result)=>{
                  alert('삭제되었습니다');
                  window.location.reload();
                  dispatch(change_page('property'));
                });
              }
            })}>삭제</span>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default Property_brd_all;