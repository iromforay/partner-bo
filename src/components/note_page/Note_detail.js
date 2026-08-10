import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Pencil, SquarePen, Edit3 } from "lucide-react";
import { useSelector } from "react-redux";
// import DaumPostcode from "react-daum-postcode";

// 💡 백엔드 연결 실패 시 사용할 퍼블리싱용 더미 데이터
const MOCK_DATA = {
  note_no: "19",

  note_type: "apt",
  note_type_txt: "아파트",

  transaction_type: "sale",
  transaction_type_txt: "매매",

  status: "1",
  status_txt: "거래가능",

  display_yn: "1",
  display_yn_txt: "노출",

  note_name: "더미데이터 ",
  building_name: null,


  addr_sido: "경남",
  addr_sigungu: "창녕군",
  addr_dong: "반포리",
  addr_road: "경남 창녕군 남지읍 골담실길 16",
  addr_detail: "",


  lat: "",
  lng: "",


  supply_area: "0",
  exclusive_area: "0",

  total_floor: "0",
  current_floor: "0",

  room_count: "0",
  bathroom_count: "0",

  parking_available: "Y",
  parking_count: "0",


  completion_date: null,
  move_in_date: null,


  direction: "S",
  direction_txt: "남",

  heating_fuel: "1",
  heating_fuel_txt: "도시가스",

  heating_type: "1",
  heating_type_txt: "개별난방",


  sale_price: "0",
  jeonse_price: "0",
  deposit_price: "0",
  monthly_rent: "0",

  loan_amount: "0",
  maintenance_fee: "0",


  summary: null,

  description: "",


  main_image: "a1c96fcdd536eb0304df01dbac0174c9.png",

  main_path: "foray/note/19/",

  main_image_url:
    "http://api.bomul.co.kr/pds/foray/note/19/a1c96fcdd536eb0304df01dbac0174c9.png",


  detail_images: [
    {
      img_no: "1",
      img_dir: "foray/note/19/",
      img_name: "a1c96fcdd536eb0304df01dbac0174c9.png",
      full_url:
        "http://api.bomul.co.kr/pds/foray/note/19/a1c96fcdd536eb0304df01dbac0174c9.png"
    },
    {
      img_no: "2",
      img_dir: "foray/note/19/",
      img_name: "a1c96fcdd536eb0304df01dbac0174c9.png",
      full_url:
        "http://api.bomul.co.kr/pds/foray/note/19/a1c96fcdd536eb0304df01dbac0174c9.png"
    }
  ],


  created_at: "2026-07-27 13:23:13",
  updated_at: "2026-07-27 13:23:13",
  view_count: "0"
};

function Note_detail() {
  const { note_no } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [memoText, setMemoText] = useState("");

  //메모 수정 state
  const [editMemoNo, setEditMemoNo] = useState(null);
  const [editMemoText, setEditMemoText] = useState("");

  const login_key = window.localStorage.getItem('login_key');
  const config = {
    headers: {
      'Authorization': `Bearer ${login_key}`
    }
  };

  let url = `${process.env.REACT_APP_API_KEY}Admin/Note/detail?note_no=${note_no}`;

  //상세 데이터 바인딩
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_KEY}Admin/Note/detail?note_no=${note_no}`,
        config
      )
      .then((res) => {

        if (res.data.SUCCESS !== "TRUE") {
          console.error("상세 조회 실패:", res.data.MSG);
          return;
        }

        const data = res.data?.RECORD?.[0];

        if (!data) {
          console.error("데이터 없음");
          return;
        }
        setData(data);

      })
      .catch((err) => {
        console.error(
          "상세 데이터 조회 실패:",
          err.response?.data || err
        );
      })
      .finally(() => {
        setLoading(false);
      });

  }, [note_no]);

  // 뱃지 및 태그 매핑 객체 
  const status_class  = { consult_request: 'tag-consult_request', consulting: 'tag-consulting', proposed: 'tag-proposed', contracted: 'tag-contracted', lost: 'tag-lost' };
  const visit_type_class  = { tenant: 'tag-tenant', landlord: 'tag-landlord' };

  //메모 등록
  const handleMemoSubmit = (e) => {
    e.preventDefault();

    if (!memoText.trim()) {
      alert("메모를 입력해주세요.");
      return;
    }


    const formData = new FormData();

    formData.append("note_no", data.note_no);
    formData.append("memo", memoText);
    formData.append("name", "");


    axios.post(
      process.env.REACT_APP_API_KEY + "Admin/memo/save",
      formData,
      config
    )
    .then((res)=>{

      console.log("메모등록 결과:", res.data);

      if(res.data.SUCCESS === "TRUE"){

        alert("메모가 등록되었습니다.");

        setMemoText("");

        // 상세 데이터 다시 조회
        axios.get(
          `${process.env.REACT_APP_API_KEY}Admin/Note/detail?note_no=${note_no}`,
          config
        )
        .then((result)=>{
          setData(result.data.RECORD[0]);
        });

      }else{
        alert(res.data.MSG);
      }

    })
    .catch((err)=>{
      console.error("메모등록 실패:", err);
      alert("메모 등록 실패");
    });

  };

  //메모 수정
  const handleMemoEdit = (memo) => {
    setEditMemoNo(memo.memo_no);
    setEditMemoText(memo.memo);
  };

  //메모 삭제
  const handleDelete = () => {
    if (!window.confirm("삭제하시겠습니까?")) return;

    const formData = new FormData();
    formData.append("note_no", data.note_no);

    axios.post(
      process.env.REACT_APP_API_KEY + "Admin/Note/delete",
      formData,
      config
    )
    .then((res) => {
      console.log("삭제 결과:", res.data);

      alert("삭제되었습니다.");
      navigate('/note');
    })
    .catch((err) => {
      console.error("삭제 실패:", err);
      alert("데이터 전송이 실패하였습니다.");
    });
  };

  //메모수정 api 호출
  const handleMemoUpdate = (e) => {

    e.preventDefault();


    const formData = new FormData();

    formData.append("memo_no", editMemoNo);
    formData.append("note_no", note_no);
    formData.append("memo", editMemoText);


    axios.post(
      process.env.REACT_APP_API_KEY + "Admin/memo/save",
      formData,
      config
    )
    .then((res)=>{

      console.log("메모 수정:", res.data);


      if(res.data.SUCCESS === "TRUE"){

        alert("수정되었습니다.");

        setEditMemoNo(null);
        setEditMemoText("");


        // 상세 다시 조회
        axios.get(
          `${process.env.REACT_APP_API_KEY}Admin/Note/detail?note_no=${note_no}`,
          config
        )
        .then((result)=>{
          setData(result.data.RECORD[0]);
        });

      }

    });

  };

  if(loading){
    return (
    <div className="sections view note_view">
      <div className="width_con">
        <div className="loading_box" style={{ padding: '100px 0', textAlign: 'center' }}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    </div>
    );
  }

  return (
    <div className="page-container container">
      <div className="sections write property_section">
        <div className="">
          <Link to="/note" className="back-link">
            ← 목록으로
          </Link>

          <div className="panel">
            {/* 기본 정보, 상단 히어로 헤더 (상태 배지, 이름, 삭제/수정 버튼) */}
            <div className="section_box">
              <div className="panel-hero">
                <div className="hero-left">
                  <div className="badge-group">
                    <span className={`tag ${status_class[data.status]}`}>
                      {data.status_txt || "-"}
                    </span>
                    <span className={`tag ${visit_type_class[data.visit_type]}`}>
                      {data.visit_type_txt || "-"}
                    </span>
                    
                  </div>

                  <div className="user-info-title">
                    {data.visitor_name || "-"}
                    <span className="user-sub-text">| {data.visitor_phone || "-"}</span>
                  </div>

                </div>    

                <div className="hero-right">
                  <span className="opt">{data.created_at || "-"}</span>
                </div>            
              </div>
            </div>

            <div className="section_box">
              <div className="panel-body">
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">거래방식</span>
                    <span className="info-value">{data.transaction_type_txt || "-"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">예산</span>
                    <span className="info-value">
                      {data.budget 
                        ? `${Number(data.budget).toLocaleString()}만원`
                        : "-"
                      } 
                    </span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">희망지역</span>
                    <span className="info-value">{data.preferred_area || "-"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">관심매물</span>
                    <span className="info-value">{data.property_name || "-"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">유입경로</span>
                    <span className="info-value">{data.inflow_type_txt || "-"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">접수자</span>
                    <span className="info-value">{data.agent_name || "미배정"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">방문예정일</span>
                    <span className="info-value">{data.visit_date || "-"}</span>
                  </div>

                  <div className="info-item">
                    <span className="info-label">다음연락예정일</span>
                    <span className="info-value">{data.next_contact_date || "-"}</span>
                  </div>

                </div>
              </div>
            </div>

              {/* 하단 버튼 바 */}
            <div className="section_box">
              <div className="btn_con">
                <div
                    className="btn btn_del"
                    onClick={handleDelete}
                  >
                    노트삭제
                </div>

                <div className="right">
                  <Link
                    className="btn btn-primary"
                    to={`/note/edit/${data.note_no}`}
                  >
                    수정하기
                  </Link>

                  <Link to="/note" className="btn btn-muted">
                    목록
                  </Link>
                  
                </div>
              </div>
            </div>
            
          </div>
            
          {/* 메모 */}
          <div className="panel">
            <div className="section_box">
              {/*  상담 메모 */}
              <div className="memo-wrap">
                <h2>상담 메모 ({data.memos?.length || 0})</h2>
                <div className="memo-thread">

                  { data.memos && data.memos.length > 0 ? (
                      data.memos.map((m)=>(
                        <div className="memo-item" key={m.memo_no}>
                          <div className="memo-avatar">{m.name.slice(0,2) || "-"}</div>
                          <div className="memo-body">
                            <div className="memo-bubble">
                              <div className="memo-byline">
                                <span className="memo-writer"> 
                                  {m.name || "-"}</span>

                                  {/* 메모등록 날짜 필요시 주석 해제   */}
                                  {/* <span className="memo-time">{m.write_date}</span> */}

                                  {editMemoNo !== m.memo_no && (
                                      <button
                                        type="button"
                                        onClick={() => handleMemoEdit(m)}
                                      >
                                        <Pencil size={11.5}/> 수정
                                      </button>
                                    )
                                  }
                              </div>

                              {/* 메모 수정 모드일 때 */}
                              {
                                editMemoNo === m.memo_no ? (

                                  <form onSubmit={handleMemoUpdate}>

                                    <textarea
                                      value={editMemoText}
                                      onChange={(e)=>setEditMemoText(e.target.value)}
                                    />

                                    <div className="memo-edit-actions">
                                      <button type="submit">저장</button>  
                                      <button type="button"
                                        onClick={()=>{
                                          setEditMemoNo(null);
                                          setEditMemoText("");
                                        }}
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </form>

                                ) : (

                                  m.memo

                                )
                              }
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="memo-empty">
                        아직 등록된 메모가 없습니다.
                      </p>
                    )
                  }
                </div>

                <form 
                  className="memo-form"
                  onSubmit={handleMemoSubmit}
                >

                  <textarea 
                    placeholder="메모를 입력하세요"
                    value={memoText}
                    onChange={(e)=>setMemoText(e.target.value)}
                  />
                  <button 
                    className="btn btn-primary"
                    type="submit"
                  >
                    등록
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

  );
}

export default Note_detail;