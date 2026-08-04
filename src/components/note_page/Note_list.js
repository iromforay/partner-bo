import { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { MessageSquare, ChevronRight } from "lucide-react";
import './note.css';

import axios from "axios";

function Note_list(props){

  let [now_data, setNow_data] = useState([]);
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

  // 검색 필터 State
  const [visitType, setVisitType] = useState('all');
  const [transaction_type, setTransaction_type] = useState('all');
  const [visitorName, setVisitorName] = useState('');
  const [phoneTxt, setPhoneTxt] = useState('');

  // 메모 모달 팝업 State
  const [memoModalData, setMemoModalData] = useState(null); // 선택된 note 객체
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemoText, setNewMemoText] = useState('');

  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  };

  // API 데이터 조회 함수
  const fetchData = useCallback((page = now_page) => {
    // 1. URL Query Parameter 생성
    const params = new URLSearchParams();
    params.append('limit', 8);
    params.append('page', page);
    if (props.whats && props.whats !== 'all') {
      params.append('status', props.whats);
    }

    // 검색 필터 조건부 추가 ('all'이나 빈값 제외)
    if (visitType && visitType !== 'all') params.append('visit_type', visitType);
    if (transaction_type && transaction_type !== 'all') params.append('transaction_type', transaction_type);
    if (visitorName.trim()) params.append('visitor_name', visitorName.trim());
    if (phoneTxt.trim()) params.append('visitor_phone', phoneTxt.trim());

    // 2. GET 요청으로 보냄 (params 전달)
    const url = process.env.REACT_APP_API_KEY + 'Admin/Note/list';

    axios.get(`${url}?${params.toString()}`, config)
      .then((result) => {
        console.log("Response:", result.data);
        if (result.data.SUCCESS === "TRUE" && result.data.RECORD) {
          // rows 데이터 상태에 업데이트
          const rows = result.data.RECORD.rows || [];

          setNow_data(rows);

          if(memoModalData){
            const updateMemoData = rows.find(
              item => item.note_no === memoModalData.note_no
            );

            if(updateMemoData){
              setMemoModalData(updateMemoData);
            }
          }

          setPage_info(result.data.RECORD.pager);
        } else {
          setNow_data([]);
        }
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
        setNow_data([]);
      });
  }, [memoModalData, now_page, visitType, transaction_type, visitorName, phoneTxt, props.whats]);

  // 페이지 이동 및 상태 탭 변경 시 데이터 로드
  useEffect(()=>{
    setNow_page(1);
    // fetchData(1);
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

  // 검색 초기화
  const handleReset = () => {
    setVisitType('all');
    setTransaction_type('all');
    setVisitorName('');
    setPhoneTxt('');
  };

  // 상태 탭 클릭 이벤트
  const handleStatusClick = (statusKey) => {
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

    if (!newMemoText.trim() || !memoModalData) return;

    const formData = new FormData();
    formData.append("note_no", memoModalData.note_no);
    formData.append("memo", newMemoText.trim());
    formData.append("name", "");

    axios.post(process.env.REACT_APP_API_KEY + "Admin/memo/save", formData, config)
      .then((res) => {
        if(res.data.SUCCESS === "TRUE"){
          alert("메모가 등록되었습니다.");
          setNewMemoText("");
          
          // 데이터 재갱신
          fetchData(now_page);
        } else {
          alert(res.data.MSG);
        }
      })
      .catch((err) => {
        console.error("팝업 메모 등록 실패:", err);
        alert("메모 등록 실패");
      });
  };

  // 페이지네이션 관련
  let page = [];
  if(page_info){
    for(let i = 0; i < page_info.total_page; i++){
      page.push('');
    }
  }

  return (
    <div className="brd all_brd">
      {/* ---- 검색 툴바 영역 ---- */}
      <div className="toolbar">
        <div className="toolbar-search">
          <select className="text-input" value={visitType} onChange={(e) => setVisitType(e.target.value)}>
            <option value="all">방문형태</option>
            <option value="tenant">세입자</option>
            <option value="landlord">임대인</option>
          </select>

          <select className="text-input" value={transaction_type} onChange={(e) => setTransaction_type(e.target.value)}>
            <option value="all">거래방식</option>
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

          <button className="btn btn-muted" onClick={handleSearch}>
            검색
          </button>
          
          <button className="btn btn-muted" onClick={handleReset}>
            초기화
          </button>
        </div>
        <div>
          <span><Link to="/note/write" className="btn btn-primary">노트 등록</Link></span>
        </div>
      </div>

      {/* ---- 리스트 테이블 영역 ---- */}
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
          {now_data && now_data.length > 0 ? (
            now_data.map((item, i) =>
              <Rows
                key={item.note_no || i}
                cfg={config}
                data={item}
                page_data={page_info}
                onOpenMemo={() => handleOpenMemoModal(item)}
                refreshData={fetchData}
                refreshParent={props.refreshParent}
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

      {/* ---- 페이지네이션 ---- */}
      <ul className='pagenation note_pagenation'>
        {page.map((_, i) => (
          <li className={now_page === i + 1 ? 'on' : ''} key={i} onClick={() => setNow_page(i + 1)}>
            <span>{i + 1}</span>
          </li>
        ))}
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
                  상세보기 <ChevronRight size={15} color="#3182f6" />
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
                    <div className="memo-avatar">{m.name || "-"}</div>
                    <div className="memo-bubble">
                      <div className="memo-byline">
                        <span className="memo-writer">{m.name}</span>
                      </div>
                      {m.memo}
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
  );
}

function Rows(props){
  let dispatch = useDispatch();
  const data = props.data;

  const status_class = { consult_request: 'tag-consult_request', consulting: 'tag-consulting', proposed: 'tag-proposed', contracted: 'tag-contracted', lost: 'tag-lost' };
  const visit_type_class = { tenant: 'tag-tenant', landlord: 'tag-landlord' };

  if(!data) return null;

  return (
    <tr className={data.display_yn === "N" ? "deleted" : ""}>
      <td>{data.num}</td>
      <td>
        <span className={`tag ${visit_type_class[data.visit_type]}`}>
          {data.visit_type_txt}
        </span>
      </td>
      <td className="col-visitor">
        <Link to={`/note/view/${data.note_no}`}>
          {data.visitor_name}
          <span className="phone">{data.visitor_phone}</span>
        </Link>
      </td>
      <td>{data.transaction_type_txt}</td>
      <td className="col-area">{data.property_no}</td>
      <td className="col-area">{data.preferred_area}</td>
      <td>
        <span className={`tag ${status_class[data.status]}`}>
          {data.status_txt ? data.status_txt : '-'}
        </span>
      </td>
      <td>
        <button className="memo-count" onClick={props.onOpenMemo}>
          <MessageSquare size={16} />
          {data.memos?.length || 0}
        </button>
      </td>
      <td className="col-date">{data.visit_date}</td>
      <td className="col-date">{data.updated_at}</td>
      <td>
        <div className="row-actions">
          <Link className="btn btn-muted" to={`/note/edit/${data.note_no}`}>
            수정
          </Link>
          <button
            type="button"
            className="btn btn_del"
            onClick={() => {
              const formData = new FormData();
              formData.append("note_no", data.note_no);

              if (window.confirm("삭제하시겠습니까?")) {
                axios.post(process.env.REACT_APP_API_KEY + "Admin/Note/delete", formData, props.cfg)
                  .then(() => {
                    alert("삭제되었습니다.");
                    
                    props.refreshData();// 리스트 다시 조회
                    props.refreshParent();//글 총갯수 다시 조회

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