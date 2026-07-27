import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { now_property_view } from '../../store';
import axios from "axios";
import $ from "jquery";

function Property_list(props){
  
  //let [data, setData] = useState(props.data);
  let data = props.data;
  let origin = props.origin_data;
  let [now_data, setNow_data] = useState();
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

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


let page = [];

if(page_info){
  for(let i = 0; i < page_info.total_page; i++){
    page.push('');
  }
}

  // useEffect(()=>{
  //   setNow_data(data);
  //   setNow_page(1);
  // }, [data]);

useEffect(()=>{

  const url = process.env.REACT_APP_API_KEY
    + 'Admin/Property/list?limit=8&page='
    + now_page
    + '&code='
    + props.whats;

  axios.get(url, config)
  .then((result)=>{

    let rows = result.data.RECORD.rows;
    let page_per_items = Number(result.data.RECORD.pager.page_per_items);

    // 1페이지가 전체리스트가 오는 문제 임시 처리
    if(rows.length > page_per_items){
      rows = rows.slice(0, page_per_items);
    }

    setNow_data(rows);
    setPage_info(result.data.RECORD.pager);

  });

}, [now_page]);
  console.log(now_data, page, page_info)

  //검색(미완)
  const handleSearch = (page = 1) => {
    let url = `${process.env.REACT_APP_API_KEY}Admin/Property/list?limit=8&page=${page}&code=${props.whats}`;
console.log("검색 실행");
    if (propertyType !== 'all') {
      url += `&property_type=${propertyType}`;
    }

    if (transaction_type !== 'all') {
      url += `&transaction_type=${transaction_type}`;
    }

    if (tradeStatus !== 'all') {
      url += `&status=${tradeStatus}`;
    }

    if (regionTxt.trim() !== '') {
      url += `&region=${encodeURIComponent(regionTxt)}`;
    }

    if (propertyNameTxt.trim() !== '') {
      url += `&property_name=${encodeURIComponent(propertyNameTxt)}`;
    }

    axios.get(url, config).then((result) => {
      setNow_data(result.data.RECORD.rows);
      setPage_info(result.data.RECORD.pager);
    });
  };
  
  //초기화
  const handleReset = () => {
    setPropertyType('all');
    setTransaction_type('all');
    setTradeStatus('all');
    setRegionTxt('');
    setPropertyNameTxt('');
    setNow_page(1);
    handleSearch(1);
  };

  //페이지 이동
  // useEffect(() => {
  //   handleSearch(now_page);
  // }, [now_page]);

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="fn_bar">
          <div className="search_con show">
            <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
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

            <select value={transaction_type} onChange={(e) => setTransaction_type(e.target.value)}>
              <option value="all"disabled hidden>거래방식</option>
              <option value="sale">매매</option>
              <option value="jeonse">전세</option>
              <option value="monthly">월세</option>
            </select>

            <select value={tradeStatus} onChange={(e) => setTradeStatus(e.target.value)}>
              <option value="all" disabled hidden>거래상태</option>
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

            <div className="btn_search" onClick={() => {
                handleSearch(1);

                if (now_page !== 1) {
                  setNow_page(1);
                } }}
            >
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
              <li className="board_transaction_type">방식</li>
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
            // {
            //   1 : page[0].map(function(a, i){
            //     return(
            //       <Rows data={page[0]} val={i} key={i}></Rows>
            //     )
            //   })
            // }[now_page]
            now_data ? now_data.map(function(a, i){
              return(
                <Rows cfg={config} data={now_data} page_data={page_info} val={i} key={i}></Rows>
              )
            }) : null
          }
        </div>
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
  let datas = props.data;
  let page_datas = props.page_data;
  let types = '';

  console.log(page_datas);

  let price = "-";

  const data = datas[props.val];

  if (data.transaction_type === "monthly") {
    price = `${Number(data.deposit_price).toLocaleString()} / ${Number(data.monthly_rent).toLocaleString()}만원`;
  }
  else if (data.transaction_type === "jeonse") {
    price = `${Number(data.jeonse_price).toLocaleString()}만원`;
  }
  else if (data.transaction_type === "sale") {
    price = `${Number(data.sale_price).toLocaleString()}만원`;
  }

  const statusClassMap = { '1': 'possible', '2': 'ing', '3': 'complete', '4': 'pending', '5': 'private' };

  const statusKey = datas[props.val].status ? String(datas[props.val].status) : '1';
  const targetClass = statusClassMap[statusKey] || 'possible';

  const displayClassMap = { '1': 'display_y', '2': 'display_n' };
  const displayKey = datas[props.val].display_yn ? String(datas[props.val].display_yn) : '1';  const targetDisplayClass = displayClassMap[displayKey] || 'display_y';

  return(
    <div className={"rows row"+(props.val+1)}>
      <ul className={datas[props.val].display_yn === "N" ? "deleted" : null}>
        <li className="board_no">
  {Number(page_datas.item_num_start) - props.val}
</li>
        <li className="board_transaction_type">{datas[props.val].transaction_type_txt || ''}</li>
        <li className="board_property_type">{datas[props.val].property_type_txt || ''}</li>
        <li className="board_property_name board_title" onClick={()=>{ dispatch(now_property_view(datas[props.val])); }}>
          <Link to={`/property/view/${datas[props.val].property_no}`}>{datas[props.val].property_name || ''}</Link></li>
        <li className="board_sigungu">
          {`${datas[props.val].addr_sigungu || ''} ${datas[props.val].addr_dong || ''}`.trim() || ''}
        </li>
        <li className="board_price">{price}</li>
        <li className="board_status"><span className={`badge ${targetClass}`}>{datas[props.val].status_txt || ''}</span></li>
        <li className="board_display_yn"><span className={`${targetDisplayClass}`}>{datas[props.val].display_yn_txt || ''}</span></li>
        <li className="board_hit">{datas[props.val].view_count}</li>
        <li className="board_date">{datas[props.val].updated_at}</li>
        <li className="board_etc">
          <div className="btns btn_edit">
            <span onClick={()=>{dispatch(now_property_view(datas[props.val]))}}><Link to={`/property/edit/${datas[props.val].property_no}`}>글수정</Link></span>
          </div>
          <div className="btns btn_del">
            <span onClick={(()=>{
              let formData = new FormData();
              formData.append('property_no', datas[props.val].property_no);
              if(window.confirm('삭제하시겠습니까?')){
                axios.post(process.env.REACT_APP_API_KEY+'', formData, props.cfg).catch(()=>{
                  alert("데이터 전송이 실패하였습니다.");
                }).then((result)=>{
                  console.log(result);
                  alert('삭제되었습니다');
                  dispatch(change_page('property'));
                });
              }
            })}>글삭제</span>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default Property_list;