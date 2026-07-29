import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { MessageSquare } from "lucide-react";
import './note.css';

import axios from "axios";
import $ from "jquery";

function Note_list(props){

  let [now_data, setNow_data] = useState();
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

  // 상단 상태 탭 필터
  const [activeStatus, setActiveStatus] = useState('all');

  // 검색 필터 State
  const [visitType, setVisitType] = useState('');
  const [transaction_type, setTransaction_type] = useState('');
  const [visitorName, setVisitorName] = useState('');
  const [phoneTxt, setPhoneTxt] = useState('');

  // 메모 모달 팝업 State
  const [memoModalData, setMemoModalData] = useState(null); // 선택된 note 객체
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');

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

  // API 데이터 로드
  useEffect(()=>{

    const url = process.env.REACT_APP_API_KEY
      + 'Admin/Note/list?limit=8&page='
      + now_page
      + '&code='
      + props.whats;

    axios.get(url, config)
    .then((result)=>{
      console.log(result.data.RECORD);
      console.log(result.data);
      let rows = result.data.RECORD.rows;

      setNow_data(rows);
      setPage_info(result.data.RECORD.pager);
      // let page_per_items = Number(result.data.RECORD.pager.page_per_items);

      // // 1페이지가 전체리스트가 오는 문제 임시 처리
      // if(rows.length > page_per_items){
      //   rows = rows.slice(0, page_per_items);
      // }

    });

  }, [now_page]);
  console.log(now_data, page, page_info)

  // 검색 실행
  const handleSearch = () => {
    setNow_page(1);
    // TODO: 백엔드 검색 API 스펙에 맞춰 query parameter 전달 로직 연결
  };

  // 검색 초기화
  const handleReset = () => {
    setVisitType('all');
    setTransaction_type('all');
    setVisitorName('');
    setPhoneTxt('');
    setActiveStatus('all');
    setNow_page(1);
  };

  // 메모 팝업 열기
  const handleOpenMemoModal = (note) => {
    setMemoModalData(note);
    setNewMemoText('');
    setIsModalOpen(true);
  };

  // 메모 팝업 닫기
  const handleCloseMemoModal = () => {
    setIsModalOpen(false);
    setMemoModalData(null);
  };

  // 신규 메모 등록 
const handleMemoSubmit = (e) => {
  e.preventDefault();

  if (!newMemoText.trim() || !memoModalData) {
    return;
  }

  const formData = new FormData();

  formData.append("note_no", memoModalData.note_no);
  formData.append("memo", newMemoText.trim());
  formData.append("name", "");


  axios.post(
    process.env.REACT_APP_API_KEY + "Admin/memo/save",
    formData,
    config
  )
  .then((res)=>{

    console.log("팝업 메모 등록:", res.data);
    if(res.data.SUCCESS === "TRUE"){

      alert("메모가 등록되었습니다.");

      // 리스트 데이터 갱신
      axios.get(
        process.env.REACT_APP_API_KEY
        + 'Admin/Note/list?limit=8&page='
        + now_page
        + '&code='
        + props.whats,
        config
      )
      .then((result)=>{

        const rows = result.data.RECORD.rows;

        setNow_data(rows);


        // 현재 열린 팝업도 갱신
        const updateNote = rows.find(
          item => item.note_no === memoModalData.note_no
        );

        if(updateNote){
          setMemoModalData(updateNote);
        }

      });

      setNewMemoText("");

    }else{
      alert(res.data.MSG);
    }

  })
  .catch((err)=>{
    console.error("팝업 메모 등록 실패:", err);
    alert("메모 등록 실패");
  });

};

  // 페이지네이션 번호 배열 생성
  const totalPages = page_info ? Number(page_info.total_page || 1) : 1;
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // 이니셜 추출 함수 (팝업 아바타용)
  const getInitials = (name) => name ? name.slice(-2) : '?';

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="toolbar">
          <div className="toolbar-search">
            <select className="text-input" value={visitType} onChange={(e) => setVisitType(e.target.value)}>
              <option value="all"disabled hidden>방문형태</option>
              <option value="tenant">세입자</option>
              <option value="landlord">임대인</option>
            </select>

            <select className="text-input" value={transaction_type} onChange={(e) => setTransaction_type(e.target.value)}>
              <option value="all"disabled hidden>거래방식</option>
              <option value="sale">매매</option>
              <option value="jeonse">전세</option>
              <option value="monthly">월세</option>
            </select>

            <input 
              type="text"  
              className="text-input" 
              placeholder="방문자명" 
              value={visitorName} 
              onChange={(e) => setVisitorName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <input 
              type="text"
              className="text-input"  
              placeholder="연락처" 
              value={phoneTxt} 
              onChange={(e) => setPhoneTxt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />

            <div className="btn btn-muted"onClick={() => {
                handleSearch(1);
                if (now_page !== 1) {
                  setNow_page(1);
                } }}
            >검색
            </div>
            
            <div className="btn btn-muted" onClick={handleReset}>
              초기화
            </div>
          </div>
          <div>
            <span><Link to="/note/write" className="btn btn-primary">노트 등록</Link></span>
          </div>
        </div>
        {/* ---- 리스트 테이블 영역 ---- */}
        <div className="panel">
          <table>
            <thead>
              <tr>
                <th>글번호</th>
                <th>방문형태</th>
                <th>방문자</th>
                <th>거래방식</th>
                <th>관심매물</th>
                <th>희망지역</th>
                <th>상태</th>
                <th>메모</th>
                <th>방문예정일</th>
                <th>등록일</th>
                <th>관리</th>
              </tr>
            </thead>

            <tbody>
              {now_data.map((a,i)=>
                <Rows
                    key={i}
                    cfg={config}
                    data={now_data}
                    page_data={page_info}
                    val={i}
                    onOpenMemo={() => handleOpenMemoModal(now_data[i])}
                />
              )}
            </tbody>
          </table>
        </div>
        <ul className='pagenation note_pagenation'>
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

        {/* ---- 메모 레이어 팝업 (Modal) ---- */}
        {isModalOpen && memoModalData && (
          <div 
            className="modal-overlay open" 
            onClick={(e) => e.target === e.currentTarget && handleCloseMemoModal()}
          >
            <div className="memo-modal">
              <div className="memo-modal-head">
                <div>
                  <h2>{memoModalData.visitor_name}</h2>
                  <div className="phone">{memoModalData.visitor_phone || '-'}</div>
                </div>
                <div className="head-actions">
                  <Link className="detail-link" to={`/note/view/${memoModalData.note_no}`}>
                    상세보기 →
                  </Link>
                  <button className="memo-modal-close" type="button" onClick={handleCloseMemoModal}>
                    ✕
                  </button>
                </div>
              </div>

              <div className="memo-modal-body">
                {memoModalData.memos && memoModalData.memos.length > 0 ? (
                  memoModalData.memos.map((m) => (
                    <div className="memo-item" key={m.memo_no}>
                      <div className="memo-avatar">
                        {m.name || "-"}
                      </div>
                      <div>
                        <div className="memo-bubble">
                          <div className="memo-byline" >
                            <span className="memo-writer">{m.name}</span>
                            {/* <span className="memo-time">{m.write_date}</span> */}
                          </div>
                          {m.memo}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="memo-empty">아직 등록된 메모가 없습니다.</p>
                )}
              </div>

              <form className="memo-modal-form" onSubmit={handleMemoSubmit}>
                <textarea 
                  placeholder="메모를 입력하세요" 
                  required 
                  value={newMemoText}
                  onChange={(e) => setNewMemoText(e.target.value)}
                />
                <button className="btn btn-primary" type="submit">등록</button>
              </form>
            </div>
          </div>
        )}
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

  const data = datas[props.val];

  // 뱃지 및 태그 매핑 객체 
  const status_class  = { consulting: 'tag-consulting', proposed: 'tag-proposed', contracted: 'tag-contracted', lost: 'tag-lost' };
  const visit_type_class  = { tenant: 'tag-tenant', landlord: 'tag-landlord' };

  return (
  <tr className={data.display_yn==="N" ? "deleted" : ""}>
      <td>{data.num}</td>

      <td>
        <span className={`tag ${visit_type_class[data.visit_type]}`}>
          {data.visit_type_txt}
        </span>
      </td>

      <td className="col-visitor">
        <Link to={`/note/view/${data.note_no}`}>
          {data.visitor_name}
        </Link>
        <span className="phone">
          {data.visitor_phone}
        </span>
      </td>

      <td>{data.transaction_type_txt}</td>

      <td className="col-area">
        {data.property_no}
      </td>

      <td className="col-area">
        {data.preferred_area}
      </td>

      <td>
        <span className={`tag ${status_class[data.status]}`}>
          {data.status_txt?data.status_txt : '-'}
        </span>
      </td>

      <td>
        <button
          className="memo-count"
          onClick={props.onOpenMemo}
        >
          <MessageSquare />
          {data.memos?.length || 0}
        </button>
      </td>

      <td className="col-date">
        {data.visit_date}
      </td>

      <td className="col-date">
        {data.updated_at}
      </td>

      <td>
        <div className="row-actions">
          <Link
            className="btn btn-muted"
            to={`/note/edit/${data.note_no}`}
          >
            수정
          </Link>

          <button
            type="button"
            className="btn btn-muted"
            onClick={() => {
              const formData = new FormData();
              formData.append("note_no", data.note_no);

              if (window.confirm("삭제하시겠습니까?")) {
                axios
                  .post(process.env.REACT_APP_API_KEY + "", formData, props.cfg)
                  .then((result) => {
                    console.log(result);
                    alert("삭제되었습니다.");
                    dispatch(change_page("note"));
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

export default Note_list;