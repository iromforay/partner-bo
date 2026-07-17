import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change_page, now_property_view } from '../../store'; // store 경로에 맞춰 조절
import { Link } from 'react-router-dom';
import axios from "axios";

// 가격 포맷팅 유틸리티
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
  let typeClass = '';
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

/* ==========================================
   1. 메인 리스트 컴포넌트
   ========================================== */
function Property_brd_all(props){
  let data = props.data;
  let origin = props.origin_data;
  let [now_data, setNow_data] = useState();
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState(origin?.pager || null);

  // 검색 조건 State
  let [propertyType, setPropertyType] = useState('all');
  let [tradeType, setTradeType] = useState('all');
  let [tradeStatus, setTradeStatus] = useState('all');
  let [regionTxt, setRegionTxt] = useState('');
  let [propertyNameTxt, setPropertyNameTxt] = useState('');

  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  };

  useEffect(()=>{
    setNow_data(data);
    setPage_info(origin?.pager);
  }, [data, origin]);

  // 검색 및 페이징 요청
  const handleSearch = (targetPage = 1) => {
    let url = `${process.env.REACT_APP_API_KEY}Admin/Property/list?limit=8&page=${targetPage}&code=${props.whats}`;

    if (propertyType !== 'all') url += `&category=${propertyType}`;
    if (tradeType !== 'all') url += `&trade_type=${tradeType}`;
    if (tradeStatus !== 'all') url += `&status=${tradeStatus}`;
    if (regionTxt.trim() !== '') url += `&region=${encodeURIComponent(regionTxt)}`;
    if (propertyNameTxt.trim() !== '') url += `&property_name=${encodeURIComponent(propertyNameTxt)}`;

    axios.get(url, config).then((result)=>{
      setNow_data(result.data.RECORD.rows); 
      setPage_info(result.data.RECORD.pager);
    }).catch(err => console.error("조회 실패", err));
  };

  // 초기화
  const handleReset = () => {
    setPropertyType('all');
    setTradeType('all');
    setTradeStatus('all');
    setRegionTxt('');
    setPropertyNameTxt('');
    setNow_page(1);

    let url = `${process.env.REACT_APP_API_KEY}Admin/Property/list?limit=8&page=1&code=${props.whats}`;
    axios.get(url, config).then((result) => {
      setNow_data(result.data.RECORD.rows);
      setPage_info(result.data.RECORD.pager);
    });
  };

  useEffect(()=>{
    handleSearch(now_page);
  }, [now_page]);

  const totalPages = page_info?.total_page || 1;
  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="fn_bar">
          <div className="search_con show">
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="all">매물종류</option>
              <option value="apartment">아파트</option>
              <option value="officetel">오피스텔</option>
            </select>

            <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
              <option value="all">거래방식</option>
              <option value="buy">매매</option>
              <option value="jeonse">전세</option>
              <option value="rent">월세</option>
            </select>

            <select value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value)}>
              <option value="all">거래상태</option>
              <option value="1">거래가능</option>
              <option value="2">거래중</option>
              <option value="3">거래완료</option>
              <option value="4">거래보류</option>
              <option value="5">비공개</option>
            </select>

            <input 
              type="text" 
              placeholder="지역" 
              value={regionTxt} 
              onChange={(e) => setRegionTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />
            
            <input 
              type="text" 
              placeholder="매물명" 
              value={propertyNameTxt} 
              onChange={(e) => setPropertyNameTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />

            <div className="btn_search" onClick={() => { setNow_page(1); handleSearch(1); }}>
              <span>검색</span>
            </div>
            
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
          {pageList.map(function(pageNum){
            return(
              <li 
                className={now_page === pageNum ? 'on' : null} 
                key={pageNum} 
                onClick={()=>{ setNow_page(pageNum); }}
              >
                <span>{pageNum}</span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

/* ==========================================
   2. 각 행을 나타내는 Rows 컴포넌트
   ========================================== */
function Rows(props){
  let dispatch = useDispatch();
  let row = props.row;
  let index = props.val;

  const { type, price } = getPropertyTypeAndPrice(row);
  const fullAddress = `${row.addr_sigungu || ''} ${row.addr_dong || ''}`.trim() || '지역 정보 없음';

  const statusClassMap = { '1': 'possible', '2': 'ing', '3': 'complete', '4': 'pending', '5': 'private' };
  const statusTextMap = { '1': '거래가능', '2': '거래중', '3': '거래완료', '4': '거래보류', '5': '비공개' };

  const statusKey = row.status ? String(row.status) : '1';
  const targetClass = statusClassMap[statusKey] || 'possible';
  const targetText = statusTextMap[statusKey] || '거래가능';

  const displayClassMap = { '1': 'display_y', '2': 'display_n' };
  const displayTextMap = { '1': 'ON', '2': 'OFF' };

  const displayKey = row.display_yn ? String(row.display_yn) : '1';
  const targetDisplayClass = displayClassMap[displayKey] || 'display_y';
  const targetDisplayText = displayTextMap[displayKey] || 'ON';

  return(
    <div className={"rows row"+(index+1)}>
      <ul className={row.display_yn === "N" ? "deleted" : null}>
        <li className="board_no">{row.property_no}</li>
        <li className="board_trade_type">{type}</li>
        <li className="board_property_type">{row.category || '유형 없음'}</li>
        <li className="board_property_name board_title" onClick={()=>{ dispatch(now_property_view(row)); }}>
          <Link to={`/property/view/${row.property_no}`}>{row.property_name || '이름 없음'}</Link>
        </li>
        <li className="board_sigungu">{fullAddress}</li>
        <li className="board_price">{price}</li>
        <li className="board_status"><span className={`badge ${targetClass}`}>{targetText}</span></li>
        <li className="board_display_yn"><span className={`${targetDisplayClass}`}>{targetDisplayText}</span></li>
        <li className="board_hit">{row.view_count || 0}</li>
        <li className="board_date">{row.completion_date ? row.completion_date.substring(0, 10) : '-'}</li>
        <li className="board_etc">
          <div className="btns btn_edit">
            <span onClick={() => { dispatch(now_property_view(row)); }}>
              <Link to={`/property/edit/${row.property_no}`}>수정</Link>
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

/* ==========================================
   3. 내보내기 (export default)
   ========================================== */
export default Property_brd_all;