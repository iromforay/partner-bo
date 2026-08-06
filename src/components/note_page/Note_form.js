import React, { useState, useEffect, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DaumPostcode from "react-daum-postcode";
/* ==========================================================================
   1. 주소 검색 팝업 모달 컴포넌트
   - 다음(Kakao) 우편번호 서비스 모달을 출력하고 선택된 주소 데이터를 반환합니다.
   ========================================================================== */
function AddressSearchModal({ onComplete, onClose }) {
  // 주소 선택 완료 처리 핸들러
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    // 도로명 주소일 경우 참고항목(건물명, 동/리) 조합
    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

    // 상위 컴포넌트로 정제된 주소 객체 전달
    onComplete({
      sido: data.sido,
      sigungu: data.sigungu,
      bname: data.bname,
      roadAddress: data.roadAddress,
      zonecode: data.zonecode,
    });
  };

  return (
    <div
      className="modal_overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 1000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "500px",
          position: "relative",
        }}
      >
        {/* 모달 닫기 버튼 */}
        <button
          onClick={onClose}
          style={{
            float: "right",
            cursor: "pointer",
            border: "none",
            background: "none",
            fontWeight: "bold",
          }}
        >
          X 닫기
        </button>
        <h4 style={{ marginBottom: "15px", fontSize: "18px", fontWeight: "bold" }}>
          주소 검색
        </h4>
        {/* 다음 주소 검색 API 컴포넌트 */}
        <DaumPostcode onComplete={handleComplete} />
      </div>
    </div>
  );
}

/* ==========================================================================
   2. 매물 등록/수정 통합 메인 컴포넌트 (note_form)
   ========================================================================== */
function Note_form() {
  const navigate = useNavigate();

  const formRef = useRef(null);
  const btn_addr_searchRef = useRef(null);

  // URL 파라미터에서 note_no 추출 (수정 모드 여부 판단)
  const { note_no } = useParams();
  
  // ★ note_no가 존재하면 수정 모드(true), 없으면 신규 등록 모드(false)
  const isEditMode = Boolean(note_no);

  // 인증 토큰 및 API 헤더 설정
  const login_key = window.localStorage.getItem("login_key");
  console.log("login_key:", login_key);
  const config = {
    headers: {
      Authorization: `Bearer ${login_key}`,
    },
  };

  /* ------------------------------------------------------------------------
     2-1. 매물 유형별 건물명 입력창 Placeholder 맵핑
     ------------------------------------------------------------------------ */
  const buildingPlaceholders = {
    apt: "예) 래미안 대치팰리스",
    villa: "예) 더힐빌라",
    house: "예) 단독주택",
    commercial: "예) 삼성프라자",
    office: "예) 건물명",
    land: "예) 토지",
    factory: "예) 건물명",
    etc: "예) 건물명",
  };

  /* ------------------------------------------------------------------------
     2-2. 유틸리티 함수: 숫자에 천 단위 콤마(,) 추가
     ------------------------------------------------------------------------ */
  const formatNumber = (numStr) => {
    if (numStr === null || numStr === undefined) return "";
    const cleanNum = numStr.toString().replace(/[^0-9]/g, "");
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("ko-KR");
  };

  /* ------------------------------------------------------------------------
     2-3. 폼 상태(State) 초기값 정의
     ------------------------------------------------------------------------ */
  const initialFormState = {
    note_no: "",
    agent_no: "",
    property_no: "",

    visitor_name: "",
    visitor_phone: "",
    visit_type: "tenant",

    transaction_type: "sale",
    budget: "",

    preferred_area: "",
    inflow_type: "visit",

    status: "consulting",

    visit_date: "",
    next_contact_date: ""
  };

  // 폼입력 데이터 상태 관리
  const [formData, setFormData] = useState(initialFormState);
  
  const [isOpenPostcode, setIsOpenPostcode] = useState(false);     // 주소 검색 모달 열림/닫힘 상태

  /* ------------------------------------------------------------------------
     2-6. [수정 모드] 기존 매물 상세 정보 조회 API
     ------------------------------------------------------------------------ */
  useEffect(() => {
      if (!isEditMode) return;

      axios
        .get(
          `${process.env.REACT_APP_API_KEY}Admin/Note/detail?note_no=${note_no}`,
          config
        )
        .then((res) => {

        // 성공 여부 확인
        if (res.data.SUCCESS !== "TRUE") {
          console.error("상세 조회 실패:", res.data.MSG);
          return;
        }

        const data = res.data?.RECORD?.[0];

        console.log("상세 rows 데이터:", data);

        if (!data) {
          console.error("rows 데이터 없음");
          return;
        }
        //detail 조회 후 바인딩 코드 추가
        setFormData(prev => ({
          ...prev,

          note_no:data.note_no ?? "",
          agent_no:data.agent_no ?? "",
          property_no:data.property_no ?? "",

          visitor_name:data.visitor_name ?? "",
          visitor_phone:data.visitor_phone ?? "",

          visit_type:data.visit_type ?? "tenant",

          transaction_type:data.transaction_type ?? "sale",

          budget:data.budget ?? "",

          preferred_area:data.preferred_area ?? "",

          inflow_type:data.inflow_type ?? "visit",

          status:data.status ?? "consulting",

          visit_date:data.visit_date?.substring(0,16) ?? "",
          next_contact_date:data.next_contact_date?.substring(0,16) ?? "",
        }));

      })
      .catch((err) => {
        console.error(
          "상세 데이터 조회 실패:",
          err.response?.data || err
        );
      });
  }, [note_no, isEditMode]);

  /* ------------------------------------------------------------------------
     2-7. 폼 입력 이벤트 핸들러
     ------------------------------------------------------------------------ */
  // 일반 텍스트 및 셀렉트 박스 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 금액 입력 전용 핸들러 (실시간으로 숫자만 추출 후 콤마 포맷팅)
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: formatNumber(value) }));
  };

  /* ------------------------------------------------------------------------
     2-10. 주소 선택 완료 핸들러 (Kakao Map 지오코딩으로 위경도 좌표 산출)
     ------------------------------------------------------------------------ */
  const handleAddressComplete = (data) => {
    let latVal = "";
    let lngVal = "";

    // 주소 상태 업데이트 함수
    const updateAddressState = (lat, lng) => {
      setFormData((prev) => ({
        ...prev,
        addr_sido: data.sido,
        addr_sigungu: data.sigungu,
        addr_dong: data.bname,
        addr_road: data.roadAddress,
        lat: lat,
        lng: lng,
      }));
    };

    // 카카오지도 SDK가 로드되어 있는 경우 좌표 검색 수행
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.roadAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          latVal = result[0].y; // 위도
          lngVal = result[0].x; // 경도
        }
        updateAddressState(latVal, lngVal);
      });
    } else {
      updateAddressState("", "");
    }
    setIsOpenPostcode(false);
  };

  /* ------------------------------------------------------------------------
     2-11. 폼 최종 제출(Submit) 처리 (등록 및 수정 공통 처리)
     ------------------------------------------------------------------------ */
  const handleSubmit = () => {
    // 유효성 검사
    const requiredFields = [
      { name: "visitor_name", label: "방문자명" },
      { name: "visitor_phone", label: "연락처" },
      { name: "visit_type", label: "방문형태" },
      { name: "transaction_type", label: "거래방식" },
      { name: "budget", label: "예산" },
      { name: "preferred_area", label: "희망지역" },
      { name: "inflow_type", label: "유입경로" },
      { name: "status", label: "진행상태" },
      { name: "visit_date", label: "방문예정일" },
      { name: "next_contact_date", label: "다음연락예정일" },
    ];

    for (const field of requiredFields) {
      const value = formData[field.name];

      if (value === "" || value === null || value === undefined) {
        alert(`${field.label}을(를) 입력해주세요.`);

        formRef.current
          ?.querySelector(`[name="${field.name}"]`)
          ?.focus();

        return;
      }
    }

    const actionText = isEditMode ? "수정" : "등록";
    if (!window.confirm(`매물 정보를 ${actionText}하시겠습니까?`)) return;

    const submitFormData = new FormData();

    Object.keys(formData).forEach((key) => {
      submitFormData.append(key, formData[key]);
    });

    // 저장 API 호출
    const apiUrl = `${process.env.REACT_APP_API_KEY}Admin/note/save`;

    axios
      .post(apiUrl, submitFormData, config)
      .then((res) => {
        alert(`매물 ${actionText}이 완료되었습니다.`);
        console.log("formData", formData);
console.log("submit", Object.fromEntries(submitFormData.entries()));
        navigate("/note");
      })
      .catch((err) => {
        console.error(`${actionText} 실패:`, err);
        alert(`매물 ${actionText}에 실패하였습니다.`);
      });
  };


  /* ==========================================================================
     3. JSX 렌더링 영역
     ========================================================================== */

  //  관심매물 임시데이터
  const [selectedProperty, setSelectedProperty] = useState({
    property_no: 108,
    property_name: "여의도 25시 공장"
  });

  return (
    <div className="sections write note_section note_form">
      
      <div className="width_con">
        <Link to="/note" className="back-link">
          ← 목록으로
        </Link>
        {/* 모드별 헤더 타이틀 분기 */}
        <h3>{isEditMode ? `노트 수정 (#${note_no})` : "노트 등록"}</h3>
          <form 
            ref={formRef}
            id="noteForm" 
            onSubmit={(e) => e.preventDefault()}>

            <div className="panel">
              {/* 1. 방문자 정보 섹션 */}
              <div className="section_box">
                <div className="sec_title_bar">
                  <h4>방문자 정보</h4>
                </div>

                <div className="grid_row col2">

                  <div className="form_group">
                    <label>
                      방문자명<span className="esenstial">*</span>
                    </label>

                    <input
                      type="text"
                      name="visitor_name"
                      value={formData.visitor_name}
                      onChange={handleChange}
                      placeholder="예) 김도윤"
                    />
                  </div>
                  <div className="form_group">
                    <label>
                      연락처<span className="esenstial">*</span>
                    </label>

                    <input
                      type="text"
                      name="visitor_phone"
                      value={formData.visitor_phone}
                      onChange={handleChange}
                      placeholder="010-0000-0000"
                    />
                  </div>
                </div>

                <div className="grid_row col2">
                  <div className="form_group">

                    <label>
                      방문형태<span className="esenstial">*</span>
                    </label>

                    <select
                      name="visit_type"
                      value={formData.visit_type}
                      onChange={handleChange}
                    >

                      <option value="tenant">
                        세입자
                      </option>

                      <option value="landlord">
                        임대인
                      </option>

                    </select>

                  </div>
                  <div className="form_group">

                    <label>
                      유입경로<span className="esenstial">*</span>
                    </label>

                    <select
                      name="inflow_type"
                      value={formData.inflow_type}
                      onChange={handleChange}
                    >

                      <option value="visit">방문</option>
                      <option value="phone">전화</option>
                      <option value="web">웹신청</option>
                      <option value="naver">네이버</option>
                      <option value="referral">지인소개</option>
                      <option value="etc">기타</option>

                    </select>

                  </div>
                </div>
              </div>

              {/* 2. 상담 정보 섹션  */}
              <div className="section_box">
                <div className="sec_title_bar">
                  <h4>상담 정보</h4>
                </div>
                <div className="grid_row col2">
                  <div className="form_group">
                    <label>거래방식<span className="esenstial">*</span></label>
                    <select
                      name="transaction_type"
                      value={formData.transaction_type}
                      onChange={handleChange}
                    >
                      <option value="sale">매매</option>
                      <option value="jeonse">전세</option>
                      <option value="monthly">월세</option>
                    </select>
                  </div>

                  <div className="form_group">
                    <label>예산
                      <span className="esenstial">*</span>
                      <span className="opt">만원 단위</span>
                    </label>

                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="예) 25000"
                    />
                  </div>
                </div>
                <div className="grid_row full">
                  <div className="form_group">
                    <label>희망지역<span className="esenstial">*</span></label>
                    <input
                      type="text"
                      name="preferred_area"
                      value={formData.preferred_area}
                      onChange={handleChange}
                      placeholder="예) 부천시 원미구 상동"
                    />
                  </div>
                </div>
                <div className="grid_row full">
                  <div className="form_group">
                    <label>진행상태<span className="esenstial">*</span></label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="consult_request">상담접수</option>
                      <option value="consulting">상담중</option>
                      <option value="proposed">매물제안</option>
                      <option value="contracted">계약완료</option>
                      <option value="lost">이탈</option>
                    </select>

                  </div>
                </div>
              </div>

              {/* 3. 일정 섹션 */}
              <div className="section_box">
                <div className="sec_title_bar">
                  <h4>일정</h4>
                </div>

                <div className="grid_row col2">
                  <div className="form_group">
                    <label>방문예정일<span className="esenstial">*</span></label>
                    <input
                      type="datetime-local"
                      name="visit_date"
                      value={formData.visit_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form_group">
                    <label>다음연락예정일<span className="esenstial">*</span></label>
                    <input
                      type="datetime-local"
                      name="next_contact_date"
                      value={formData.next_contact_date}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* 4. 배정 섹션 */}
              <div className="section_box">
                <div className="sec_title_bar"><h4>배정 (선택)</h4></div>
                <div className="grid_row col2">
                  <div className="form_group">
                    <label>접수자<span className="opt">(담당 중개사)</span></label>
                    <select
                      name="agent_no"
                      value={formData.agent_no}
                      onChange={handleChange}
                    >
                      <option value="">미배정</option>
                      <option value="1">나병연</option>
                      <option value="2">김상담</option>
                    </select>
                  </div>

                  <div className="form_group">
                    <label>
                      관심매물
                      <span className="opt">등록된 매물과 연결</span>
                    </label>

                    <div className="property_pick">
                      <input
                        type="text"
                        placeholder="매물명으로 검색"
                      />

                      <button
                        type="button"
                        className="btn btn-muted search_btn"
                        onClick={() =>
                          setSelectedProperty({
                            property_no: 108,
                            property_name: "여의도 25시 공장",
                          })
                        }
                      >
                        검색
                      </button>
                    </div>

                    {/* 실제 저장될 값 */}
                    <input
                      type="hidden"
                      name="property_no"
                      value={selectedProperty?.property_no || ""}
                    />

                    {selectedProperty && (
                      <div className="picked_property">
                        <span>{selectedProperty.property_name}</span>

                        <button
                          type="button"
                          onClick={() => setSelectedProperty(null)}
                        >
                          해제 ✕
                        </button>
                      </div>
                    )}

                    <p className="help">
                      비워두면 특정 매물과 연결하지 않고 저장됩니다.
                    </p>
                  </div>

                </div>
              </div>
            </div>      

            {/* 3-6. 하단 저장 / 취소 버튼 */}
            <div className="section_box">
              <div className="btn_con">
                <div></div>

                <div className="right">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSubmit}
                  >
                    {isEditMode ? "저장하기" : "등록하기"}
                  </button>

                  <div className="btn btn-muted">
                    <span>
                      <Link to="/note">
                        취소
                      </Link>
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </form>
      </div>

      {/* 3-7. 주소 검색 모달 조건부 렌더링 */}
      {isOpenPostcode && (
        <AddressSearchModal
          onComplete={handleAddressComplete}
          onClose={() => setIsOpenPostcode(false)}
        />
      )}
    </div>
  );
}

export default Note_form;