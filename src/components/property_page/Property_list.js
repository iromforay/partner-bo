import { useEffect, useMemo, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { now_property_view } from '../../store';
import axios from "axios";
import $ from "jquery";
import './property.css';
import '../note_page/note.css';


function Property_list(props){
  
  let data = props.data;
  let origin = props.origin_data;
  let [now_data, setNow_data] = useState([]);
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

  //검색 필터 state
  const [propertyType, setPropertyType] = useState('all');
  const [transaction_type, setTransaction_type] = useState('all');//거래방식
  const [tradeStatus, setTradeStatus] = useState('all');
  const [regionTxt, setRegionTxt] = useState('');
  const [propertyNameTxt, setPropertyNameTxt] = useState('');

  console.log(data);
  console.log(origin);

  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }


// let page = [];

// if(page_info){
//   for(let i = 0; i < page_info.total_page; i++){
//     page.push('');
//   }
// }

  // API 데이터 조회 함수
  const fetchData = useCallback((page = now_page) => {

    const params = new URLSearchParams();

    params.append("limit", 8);
    params.append("page", page);

    if(props.whats === "display_y"){
      params.append("display_yn","1");
    }

    if(props.whats === "display_n"){
      params.append("display_yn","2");
    }

    if(props.whats === "status_3"){
      params.append("status","3");
    }

    // 검색 조건
    if(propertyType !== "all"){
      params.append("property_type", propertyType);
    }

    if(transaction_type !== "all"){
      params.append("transaction_type", transaction_type);
    }

    if(tradeStatus !== "all"){
      params.append("status", tradeStatus);
    }

    if(regionTxt.trim()){
      params.append(
        "region",
        regionTxt.trim()
      );
    }

    if(propertyNameTxt.trim()){
      params.append(
        "property_name",
        propertyNameTxt.trim()
      );
    }


    const url =
      process.env.REACT_APP_API_KEY +
      "Admin/Property/list";


    axios.get(
      `${url}?${params.toString()}`,
      config
    )
    .then((result)=>{

      console.log("Property Response", result.data);


      if(
        result.data.SUCCESS === "TRUE" &&
        result.data.RECORD
      ){

        let rows = result.data.RECORD.rows || [];

        setNow_data(rows);
        setPage_info(result.data.RECORD.pager);

      }else{
        setNow_data([]);
      }

    })
    .catch((err)=>{
      console.log(err);
      setNow_data([]);
    });


  },[
    now_page,
    propertyType,
    transaction_type,
    tradeStatus,
    regionTxt,
    propertyNameTxt,
    props.whats
  ]);

  // 페이지 이동 및 상태 탭 변경 시 데이터 로드
  useEffect(()=>{
    setNow_page(1);
    fetchData(1);
  }, [props.whats]);

  // 페이지 이동  
  useEffect(()=>{
    fetchData(now_page);
  }, [now_page, props.whats]);

  // 검색 실행
  const handleSearch = () => {
    if (now_page === 1) {
      fetchData(1);
    } else {
      setNow_page(1); // useEffect에 의해 자동 실행
    }
  };
  
  //검색 초기화
  const handleReset = () => {
    setPropertyType("all");
    setTransaction_type("all");
    setTradeStatus("all");
    setRegionTxt("");
    setPropertyNameTxt("");
  };

  // 페이지네이션 관련
  let page = [];
  if(page_info){
    for(let i = 0; i < page_info.total_page; i++){
      page.push('');
    }
  }

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="toolbar">
          <div className="toolbar-search">
            <select className="text-input" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
              <option value="all"disabled hidden>매물종류</option>
              <option value="apt">아파트</option>
              <option value="officetel">오피스텔</option>
              <option value="villa">빌라/연립</option>
              <option value="house">단독주택</option>
              <option value="land">토지</option>
              <option value="commercial">상가</option>
              <option value="office">사무실</option>
              <option value="factory">공장</option>
              <option value="warehouse">창고</option>
              <option value="knowledge">지식산업센터</option>
              <option value="building">건물</option>
              <option value="motel">숙박</option>
              <option value="etc">기타</option>
            </select>

            <select className="text-input"  value={transaction_type} onChange={(e) => setTransaction_type(e.target.value)}>
              <option value="all"disabled hidden>거래방식</option>
              <option value="sale">매매</option>
              <option value="jeonse">전세</option>
              <option value="monthly">월세</option>
            </select>

            {/* <select className="text-input"  value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value)}>
              <option value="all" disabled hidden>거래상태</option>
              <option value="1">거래가능</option>
              <option value="2">거래중</option>
              <option value="3">거래완료</option>
              <option value="4">거래보류</option>
              <option value="5">비공개</option>
            </select> */}

            <input 
              type="text"  className="text-input" 
              placeholder="지역" 
              value={regionTxt} 
              onChange={(e) => setRegionTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />
            
            <input 
              type="text"  className="text-input" 
              placeholder="매물명" 
              value={propertyNameTxt} 
              onChange={(e) => setPropertyNameTxt(e.target.value)} 
              onKeyDown={(e) => { if(e.key === 'Enter') { setNow_page(1); handleSearch(1); } }}
            />

            <div className="btn btn-muted" onClick={() => {
                handleSearch();
              }}
            >
              <span>검색</span>
            </div>
            
            <div className="btn btn-muted" onClick={handleReset}>
              <span>초기화</span>
            </div>
          </div>
          <Link to="/property/write" className="btn btn-primary">매물 등록</Link>
        </div>

        {/* ---- 리스트 테이블 영역 ---- */}
        <table>
          <thead>
            <tr>
              <th>글번호</th>
              <th>방식</th>
              <th>종류</th>
              <th>매물명</th>
              <th>지역</th>
              <th>가격</th>
              <th>상태</th>
              <th>노출</th>
              <th>조회</th>
              <th>등록일</th>
              <th>관리</th>
            </tr>
          </thead>
              
          <tbody>
            {now_data && now_data.length > 0 ? (
              now_data.map((item, i) =>
                <Rows
                  key={item.note_no || i}
                  cfg={config}
                  data={item}
                  page_data={page_info}
                  index={i}
                />
              )
            ) : (
              <tr>
                <td colSpan="11">
                  조회된 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <ul className='pagenation property_pagenation'>
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
  const data = props.data;
  const page_datas = props.page_data; // 추가

  let types = '';

  if(!data){
    return null;
  }

  // 금액 표시 함수 (만원 → 억/만원)
  const formatPrice = (price) => {

    if (!price || Number(price) === 0) {
      return "-";
    }

    const num = Number(price);

    const eok = Math.floor(num / 10000);
    const man = num % 10000;

    if (eok > 0 && man > 0) {
      return `${eok}억 ${man.toLocaleString()}`;
    }

    if (eok > 0) {
      return `${eok}억`;
    }

    return `${num.toLocaleString()}`;
  };

  // 월세 표시용 (보증금/월세)
  const formatMonthlyPrice = (deposit, rent) => {

    const depositText = Number(deposit) > 0
      ? formatPrice(deposit)
      : "-";

    const rentText = Number(rent) > 0
      ? Number(rent).toLocaleString()
      : "-";

    return `${depositText} / ${rentText}`;
  };

  //매물 방식별 가격 표시
  const getTradePrice = (data) => {

    switch(data.transaction_type){

      case "sale":
        return formatPrice(data.sale_price);

      case "jeonse":
        return formatPrice(data.jeonse_price);

      case "monthly":
        return formatMonthlyPrice(
          data.deposit_price,
          data.monthly_rent
        );

      default:
        return "-";
    }

  };

  // 상태 태그
  const statusClass = {
    '1':'possible',
    '2':'ing',
    '3':'complete',
    '4':'pending',
    '5':'private'
  };

  const statusKey = data.status
    ? String(data.status)
    : '1';

  // 노출 상태
  const displayClass = {
    '1':'display_y',
    '2':'display_n'
  };

  return(
    <tr className={data.display_yn === "N" ? "deleted" : ""}>
      <td>
        {Number(page_datas.item_num_start) - props.index}
      </td>

      <td>
        {data.transaction_type_txt || '-'}
      </td>

      <td>
        {data.property_type_txt || '-'}
      </td>

      <td className="col-property">
        <Link 
          to={`/property/view/${data.property_no}`}
          onClick={()=>{
            dispatch(now_property_view(data));
          }}
        >
          {data.property_name || '-'}
        </Link>
      </td>

      <td>
        {
          `${data.addr_sigungu || ''} ${data.addr_dong || ''}`
          .trim() || '-'
        }
      </td>

      <td>
        {getTradePrice(data)}
      </td>

      <td>
        <span className={`tag ${statusClass[statusKey]}`}>
          {data.status_txt || '-'}
        </span>
      </td>

      <td>
        <span className={`tag ${displayClass[data.display_yn]}`}>
          {data.display_yn_txt || '-'}
        </span>
      </td>

      <td>
        {data.view_count || 0}
      </td>

      <td className="col-date">
        {data.updated_at || '-'}
      </td>

      <td>
        <div className="row-actions">
          <Link
            className="btn btn-muted"
            to={`/property/edit/${data.property_no}`}>
              수정
          </Link>

          <button
            type="button"
            className="btn btn-muted"
            onClick={() => {
              const formData = new FormData();
              formData.append("property_no", data.property_no);

              if (window.confirm("삭제하시겠습니까?")) {
                axios
                  .post(process.env.REACT_APP_API_KEY + "Admin/Property/board_del", formData, props.cfg)
                  .then((result) => {
                    console.log(result);
                    alert("삭제되었습니다.");
                    dispatch(change_page("property"));
                  })
                  .catch(() => {
                    alert("데이터 전송이 실패하였습니다.");
                  });
              }
            }}
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}

export default Property_list;