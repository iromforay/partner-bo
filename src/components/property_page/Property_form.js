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
   2. 매물 등록/수정 통합 메인 컴포넌트 (Property_form)
   ========================================================================== */
function Property_form() {
  const navigate = useNavigate();

  const propertyNameRef = useRef(null);
  const btn_addr_searchRef = useRef(null);

  // URL 파라미터에서 property_no 추출 (수정 모드 여부 판단)
  const { property_no } = useParams();
  
  // ★ property_no가 존재하면 수정 모드(true), 없으면 신규 등록 모드(false)
  const isEditMode = Boolean(property_no);

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
    property_no: "",
    property_type: "apt",
    transaction_type:"sale",
    status: "1",
    display_yn: "1",
    property_name: "",
    building_name: "",
    addr_sido: "",
    addr_sigungu: "",
    addr_dong: "",
    addr_road: "",
    addr_detail: "",
    lat: "",
    lng: "",
    supply_area: "",
    exclusive_area: "",
    total_floor: "",
    current_floor: "",
    room_count: "",
    bathroom_count: "",
    parking_available: "Y",
    parking_count: "",
    completion_date: "",
    move_in_date: "",
    direction: "S",
    heating_fuel: "1",
    heating_type: "1",
    sale_price: "0",
    jeonse_price: "0",
    deposit_price: "0",
    monthly_rent: "0",
    loan_amount: "0",
    maintenance_fee: "",
    summary: "",
    description: "",
  };

  // 폼입력 데이터 상태 관리
  const [formData, setFormData] = useState(initialFormState);

  /* ------------------------------------------------------------------------
     2-4. 이미지 관련 상태(State) 관리
     ------------------------------------------------------------------------ */
  // 대표 이미지 파일 정보
  const [mainImage, setMainImage] = useState(null);
  // 대표 이미지 미리보기 URL
  const [upload_thumb_img, setUploadThumbImg] = useState("");

  // 상세 이미지 관리 (서버 기존 이미지 vs 클라이언트 신규 추가 이미지)
  const [existingDetailImgs, setExistingDetailImgs] = useState([]); // 서버에 저장되어 있던 기존 이미지
  const [newDetailFiles, setNewDetailFiles] = useState([]);       // 신규 추가된 이미지 파일 객체 및 미리보기 [{ path, name, preview }]

  // 이미지 삭제 추적 상태
  const [deleteImgNos, setDeleteImgNos] = useState([]); // 삭제할 기존 상세 이미지 번호 목록
  const [deleteMain, setDeleteMain] = useState(false);  // 기존 대표 이미지 삭제 여부 플래그

  /* ------------------------------------------------------------------------
     2-5. UI 및 드래그 앤 드롭 상태(State) 관리
     ------------------------------------------------------------------------ */
  const [isThumbDragging, setIsThumbDragging] = useState(false);   // 대표 이미지 드래그 호버 상태
  const [isDetailDragging, setIsDetailDragging] = useState(false); // 상세 이미지 드래그 호버 상태
  const [isOpenPostcode, setIsOpenPostcode] = useState(false);     // 주소 검색 모달 열림/닫힘 상태

  /* ------------------------------------------------------------------------
     2-6. [수정 모드] 기존 매물 상세 정보 조회 API
     ------------------------------------------------------------------------ */
  useEffect(() => {
      if (!isEditMode) return;

      axios
        .get(
          `${process.env.REACT_APP_API_KEY}Admin/Property/detail?property_no=${property_no}`,
          config
        )
        .then((res) => {

  console.log("상세 API 전체:", res.data);
  console.log("SUCCESS 값:", res.data.SUCCESS);
  console.log("RECORD:", res.data.RECORD);
  console.log("rows:", res.data.RECORD?.rows);
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
          property_no: data.property_no ?? "",
          property_type: data.property_type ?? "apt",
          transaction_type: data.transaction_type ?? "sale",
          status: String(data.status ?? "1"),
          display_yn: String(data.display_yn ?? "1"),

          property_name: data.property_name ?? "",
          building_name: data.building_name ?? "",

          addr_sido: data.addr_sido ?? "",
          addr_sigungu: data.addr_sigungu ?? "",
          addr_dong: data.addr_dong ?? "",
          addr_road: data.addr_road ?? "",

          supply_area: data.supply_area ?? "",
          exclusive_area: data.exclusive_area ?? "",
          total_floor: data.total_floor ?? "",
          current_floor: data.current_floor ?? "",
          room_count: data.room_count ?? "",
          bathroom_count: data.bathroom_count ?? "",

          parking_available: data.parking_available ?? "Y",
          parking_count: data.parking_count ?? "",

          completion_date:
            data.completion_date?.substring(0,10) ?? "",

          move_in_date:
            data.move_in_date?.substring(0,10) ?? "",

          direction: data.direction ?? "S",

          heating_fuel:String(data.heating_fuel ?? "1"),
          heating_type:String(data.heating_type ?? "1"),

          sale_price:formatNumber(data.sale_price),
          jeonse_price:formatNumber(data.jeonse_price),
          deposit_price:formatNumber(data.deposit_price),
          monthly_rent:formatNumber(data.monthly_rent),
          loan_amount:formatNumber(data.loan_amount),
          maintenance_fee:formatNumber(data.maintenance_fee),

          summary:data.summary ?? "",
          description:data.description ?? "",
        }));

        // 대표 이미지 바인딩
        if (data.main_image_url) {
          setUploadThumbImg(data.main_image_url);

          setMainImage({
            path: data.main_path,
            name: data.main_image,
            url: data.main_image_url,
          });
        }

        // 상세 이미지 바인딩
        if (data.detail_images) {

          let detailImgs = data.detail_images;

          // 문자열 JSON이면 변환
          if (typeof detailImgs === "string") {
            try {
              detailImgs = JSON.parse(detailImgs);
            } catch (e) {
              detailImgs = [];
            }
          }

          setExistingDetailImgs(detailImgs);
        }

      })
      .catch((err) => {
        console.error(
          "상세 데이터 조회 실패:",
          err.response?.data || err
        );
      });
  }, [property_no, isEditMode]);

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
     2-8. 이미지 업로드/미리보기/삭제 관련 함수들
     ------------------------------------------------------------------------ */
  // 이미지 서버 업로드 API 요청
  const uploadImage = async (file) => {
    const fd = new FormData();
    fd.append("image", file);

    const res = await axios.post(
      `${process.env.REACT_APP_API_KEY}Admin/Property/upload_images`,
      fd,
      config
    );

    console.log("이미지 업로드 결과:", res.data);

    if (res.data.SUCCESS !== "TRUE") {
      alert(res.data.MSG);
      throw new Error(res.data.MSG);
    }

    return res.data.RECORD;
  };

  // 대표 이미지 선택 및 프리뷰 처리
  const previewThumb = async (files) => {
    if (!files.length) return;
    const file = files[0];

    try {
      const rows = await uploadImage(file);

      // 새 이미지가 등록되면 기존 대표 이미지 삭제 플래그 해제
      setDeleteMain(false);

      setMainImage({
        path: rows.file_path,
        name: rows.file_name,
        url: rows.file_url,
      });

      setUploadThumbImg(rows.file_url);
    } catch (e) {
      alert("대표 이미지 업로드 실패");
    }
  };

  // 상세 이미지 다중 선택 및 프리뷰 처리 (최대 10장 제한)
  const previewDetails = async (files) => {
    const fileArray = Array.from(files);

    if (existingDetailImgs.length + newDetailFiles.length + fileArray.length > 10) {
      alert("최대 10장까지 등록 가능합니다.");
      return;
    }

    for (const file of fileArray) {
      const rows = await uploadImage(file);

      setNewDetailFiles((prev) => [
        ...prev,
        {
          path: rows.file_path,
          name: rows.file_name,
          preview: rows.file_url,
        },
      ]);
    }
  };

  // 기존 상세 이미지 삭제 핸들러 (서버 DB 삭제 대상 배열에 추가)
  const handleRemoveExistingDetailImg = (index) => {
    const deleteImg = existingDetailImgs[index];
    if (!deleteImg?.img_no) return;

    // 삭제할 img_no 중복 없이 수집
    setDeleteImgNos((prev) => [...new Set([...prev, deleteImg.img_no])]);

    // 화면 목록에서 제거
    setExistingDetailImgs((prev) => prev.filter((_, i) => i !== index));
  };

  // 신규 추가된 상세 이미지 삭제 핸들러 (클라이언트 배열에서 제거)
  const handleRemoveNewDetailFile = (index) => {
    setNewDetailFiles((prev) => prev.filter((_, i) => i !== index));
  };

  /* ------------------------------------------------------------------------
     2-9. 이미지 드래그 앤 드롭(Drag & Drop) 이벤트 핸들러
     ------------------------------------------------------------------------ */
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 대표 이미지 드롭
  const handleThumbDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbDragging(false);
    if (e.dataTransfer.files?.length) previewThumb(e.dataTransfer.files);
  };

  // 상세 이미지 드롭
  const handleDetailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailDragging(false);
    if (e.dataTransfer.files?.length) previewDetails(e.dataTransfer.files);
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
    if (!formData.property_name.trim()) {
      alert("매물명을 입력해주세요.");
      propertyNameRef.current?.focus();
      return;
    }
    if (!formData.addr_sido || !formData.addr_sigungu || !formData.addr_dong) {
      alert("주소 검색을 통해 주소를 선택해주세요.");
      btn_addr_searchRef.current?.focus();
      return;
    }

    const actionText = isEditMode ? "수정" : "등록";
    if (!window.confirm(`매물 정보를 ${actionText}하시겠습니까?`)) return;

    const submitFormData = new FormData();

    // 1) 가격 항목 콤마 제거 후 FormData에 바인딩
    const priceKeys = [
      "sale_price",
      "jeonse_price",
      "deposit_price",
      "monthly_rent",
      "loan_amount",
      "maintenance_fee",
    ];
    Object.keys(formData).forEach((key) => {
      if (priceKeys.includes(key)) {
        const rawPrice = (formData[key] || "0").toString().replace(/,/g, "");
        submitFormData.append(key, rawPrice);
      } else {
        submitFormData.append(key, formData[key]);
      }
    });

    // 2) 대표 이미지 바인딩
    if (mainImage) {
      submitFormData.append(
        "main_image",
        mainImage
          ? JSON.stringify({
              path: mainImage.path,
              name: mainImage.name,
            })
          : ""
      );
    }
    submitFormData.append("main_image_url", mainImage?.url || "");

    // 3) 기존 + 신규 상세 이미지 통합 데이터 조합
    const detailImages = [
      ...existingDetailImgs.map((img) => ({
        path: img.img_dir,
        name: img.img_name,
      })),
      ...newDetailFiles.map((img) => ({
        path: img.path,
        name: img.name,
      })),
    ];
    submitFormData.append("detail_images", JSON.stringify(detailImages));

    // 4) 삭제 대상 이미지 정보 바인딩 (기존 대표 이미지 삭제 여부, 상세 이미지 ID 배열)
    submitFormData.append(
      "del_img",
      JSON.stringify({
        main: deleteMain,
        img_no: deleteImgNos,
      })
    );
console.log(
  "삭제 데이터",
  {
    main: deleteMain,
    img_no: deleteImgNos
  }
);
    // 저장 API 호출
    const apiUrl = `${process.env.REACT_APP_API_KEY}Admin/Property/save`;

    axios
      .post(apiUrl, submitFormData, config)
      .then((res) => {
        alert(`매물 ${actionText}이 완료되었습니다.`);
        navigate("/property");
      })
      .catch((err) => {
        console.error(`${actionText} 실패:`, err);
        alert(`매물 ${actionText}에 실패하였습니다.`);
      });
  };

  /* ------------------------------------------------------------------------
     2-12. ReactQuill 텍스트 에디터 툴바 옵션 설정
     ------------------------------------------------------------------------ */
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  /* ==========================================================================
     3. JSX 렌더링 영역
     ========================================================================== */
  return (
    <div className="sections write property_section">
      <div className="width_con">
        {/* 모드별 헤더 타이틀 분기 */}
        <h3>{isEditMode ? "매물 수정" : "매물 등록"}</h3>
        <div className="form_con">
          <form id="propertyForm" onSubmit={(e) => e.preventDefault()}>
            
            {/* 3-1. 기본정보 섹션 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>기본정보</h4>
              </div>
              <div className="grid_row col4">
                <div className="form_group">
                  <label>매물종류</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange}>
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
                </div>
                <div className="form_group">
                  <label>거래방식</label>
                  <select name="transaction_type" value={formData.transaction_type} onChange={handleChange}>
                    <option value="sale">매매</option>
                    <option value="jeonse">전세</option>
                    <option value="monthly">월세</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래상태</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="1">거래가능</option>
                    <option value="2">거래중</option>
                    <option value="3">거래완료</option>
                    <option value="4">거래보류</option>
                    <option value="5">비공개</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>노출여부</label>
                  <select name="display_yn" value={formData.display_yn} onChange={handleChange}>
                    <option value="1">노출</option>
                    <option value="2">숨김</option>
                  </select>
                </div>
              </div>

              <div className="grid_row col2">
                <div className="form_group">
                  <label>매물명<span className="esenstial">*필수</span></label>
                  <input
                    ref={propertyNameRef}
                    type="text"
                    name="property_name"
                    value={formData.property_name}
                    onChange={handleChange}
                    placeholder="매물명"
                  />
                </div>
                <div className="form_group">
                  <label>건물명</label>
                  <input
                    type="text"
                    name="building_name"
                    value={formData.building_name}
                    onChange={handleChange}
                    placeholder={buildingPlaceholders[formData.property_type] || "예) 건물명"}
                  />
                </div>
              </div>
            </div>

            {/* 3-2. 위치정보 섹션 (주소검색 API 연결) */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>위치정보</h4>
                <div 
                  ref={btn_addr_searchRef}
                  tabIndex="0"//포커스를 받을 수 있게 만드는 HTML 속성
                  className="btn_search btn_addr_search" 
                  onClick={() => setIsOpenPostcode(true)}
                  >
                  <span>주소 검색</span>
                </div>
              </div>

              <div className="grid_row col4">
                <div className="form_group">
                  <label>주소(시도)<span className="esenstial">*필수</span></label>
                  <input type="text" name="addr_sido" value={formData.addr_sido} readOnly placeholder="시/도" />
                </div>
                <div className="form_group">
                  <label>주소(시군구)<span className="esenstial">*필수</span></label>
                  <input type="text" name="addr_sigungu" value={formData.addr_sigungu} readOnly placeholder="시/군/구" />
                </div>
                <div className="form_group">
                  <label>주소(읍면동)<span className="esenstial">*필수</span></label>
                  <input type="text" name="addr_dong" value={formData.addr_dong} readOnly placeholder="읍/면/동" />
                </div>
                <div className="form_group display_none">
                  <label>좌표 정보</label>
                  <div className="dashed_box">
                    {formData.lat && formData.lng ? `위도: ${formData.lat} / 경도: ${formData.lng}` : "위도/경도 (자동산출)"}
                  </div>
                </div>
              </div>

              <div className="grid_row col2">
                <div className="form_group">
                  <label>도로명주소</label>
                  <input type="text" name="addr_road" value={formData.addr_road} readOnly placeholder="도로명 주소" />
                </div>
                <div className="form_group">
                  <label>상세주소</label>
                  <input
                    type="text"
                    name="addr_detail"
                    value={formData.addr_detail}
                    onChange={handleChange}
                    placeholder="상세 주소 입력 (동/호수 등)"
                  />
                </div>
              </div>
            </div>

            {/* 3-3. 매물 상세 수치 정보 섹션 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>매물 정보</h4>
              </div>
              <div className="grid_row col4">
                <div className="form_group">
                  <label>공급면적 (㎡)</label>
                  <input type="number" name="supply_area" value={formData.supply_area} onChange={handleChange} placeholder="0" />
                </div>
                <div className="form_group">
                  <label>전용면적 (㎡)</label>
                  <input type="number" name="exclusive_area" value={formData.exclusive_area} onChange={handleChange} placeholder="0" />
                </div>
                <div className="form_group">
                  <label>총 층수</label>
                  <input type="number" name="total_floor" value={formData.total_floor} onChange={handleChange} placeholder="총층" />
                </div>
                <div className="form_group">
                  <label>해당 층</label>
                  <input type="number" name="current_floor" value={formData.current_floor} onChange={handleChange} placeholder="해당층" />
                </div>
                <div className="form_group">
                  <label>방수</label>
                  <input type="number" name="room_count" value={formData.room_count} onChange={handleChange} placeholder="방" />
                </div>
                <div className="form_group">
                  <label>욕실수</label>
                  <input type="number" name="bathroom_count" value={formData.bathroom_count} onChange={handleChange} placeholder="욕실" />
                </div>
                <div className="form_group">
                  <label>주차 가능</label>
                  <select name="parking_available" value={formData.parking_available} onChange={handleChange}>
                    <option value="Y">가능</option>
                    <option value="N">불가</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>대수</label>
                  <input type="number" name="parking_count" value={formData.parking_count} onChange={handleChange} placeholder="대수" />
                </div>
                <div className="form_group">
                  <label>준공일</label>
                  <input type="date" name="completion_date" value={formData.completion_date} onChange={handleChange} />
                </div>
                <div className="form_group">
                  <label>입주가능일</label>
                  <input type="date" name="move_in_date" value={formData.move_in_date} onChange={handleChange} />
                </div>
                <div className="form_group">
                  <label>방향</label>
                  <select name="direction" value={formData.direction} onChange={handleChange}>
                    <option value="S">남향</option>
                    <option value="SE">남동향</option>
                    <option value="SW">남서향</option>
                    <option value="E">동향</option>
                    <option value="W">서향</option>
                    <option value="N">북향</option>
                    <option value="NE">북동향</option>
                    <option value="NW">북서향</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>난방연료</label>
                  <select name="heating_fuel" value={formData.heating_fuel} onChange={handleChange}>
                    <option value="1">도시가스</option>
                    <option value="2">전기</option>
                    <option value="3">LPG</option>
                    <option value="4">기름</option>
                    <option value="9">기타</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>난방방식</label>
                  <select name="heating_type" value={formData.heating_type} onChange={handleChange}>
                    <option value="1">개별난방</option>
                    <option value="2">중앙난방</option>
                    <option value="3">지역난방</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3-4. 가격 및 상세 설명 섹션 (Quill 에디터 연동) */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>가격 및 소개</h4>
              </div>
              <div className="grid_row col4">
                <div className="form_group">
                  <label>매매가 (만원)</label>
                  <input type="text" name="sale_price" placeholder="0" value={formData.sale_price} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>전세가 (만원)</label>
                  <input type="text" name="jeonse_price" placeholder="0" value={formData.jeonse_price} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>보증금 (만원)</label>
                  <input type="text" name="deposit_price" placeholder="0" value={formData.deposit_price} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>월세 (만원)</label>
                  <input type="text" name="monthly_rent" placeholder="0" value={formData.monthly_rent} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>융자금 (만원)</label>
                  <input type="text" name="loan_amount" placeholder="0" value={formData.loan_amount} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>관리비 (만원)</label>
                  <input type="text" name="maintenance_fee" placeholder="0" value={formData.maintenance_fee} onChange={handlePriceChange} />
                </div>
              </div>

              <div className="grid_row full">
                <div className="form_group">
                  <label>한줄소개</label>
                  <input
                    type="text"
                    name="summary"
                    value={formData.summary}
                    onChange={handleChange}
                    placeholder="리스트에 노출될 요약 문구를 입력하세요."
                  />
                </div>
              </div>
              <div>
                <div className="form_group">
                  <label>상세설명</label>
                  {/* ReactQuill 웹 에디터 */}
                  <ReactQuill
                    modules={modules}
                    value={formData.description}
                    onChange={(content) =>
                      setFormData((prev) => ({ ...prev, description: content }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* 3-5. 사진 업로드 영역 (대표 이미지 & 상세 이미지 드래그앤드롭 지원) */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>사진 정보</h4>
              </div>
              <div className="image_upload_container">
                
                {/* (1) 대표 이미지 업로드 영역 */}
                <div className="thumb_upload_area">
                  <p className="row_desc">대표 이미지 (파일을 드래그하여 업로드하세요)</p>
                  <div className="detail_grid">
                    {upload_thumb_img === "" ? (
                      /* 대표 이미지 미등록 상태 - 파일 입력/드래그앤드롭 박스 */
                      <label
                        className={`upload_box add_btn ${isThumbDragging ? "dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setIsThumbDragging(true)}
                        onDragLeave={() => setIsThumbDragging(false)}
                        onDrop={handleThumbDrop}
                      >
                        <input
                          // type="file"
                          accept="image/*"
                          onChange={(e) => previewThumb(e.target.files)}
                          style={{ display: "none" }}
                        />
                        <span className="upload_placeholder">+ 대표사진 / 드래그</span>
                      </label>
                    ) : (
                      /* 대표 이미지 등록된 상태 - 미리보기 & 삭제 버튼 */
                      <div className="upload_img_item upload_img">
                        <img src={upload_thumb_img} alt="대표 미리보기" />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => {
                            setUploadThumbImg("");
                            setMainImage(null);

                            if (isEditMode) {//수정시에만 기존 대표이미지 삭제 플레그 설정
                              setDeleteMain(true);
                              console.log("대표이미지 삭제 체크");
                            }
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* (2) 상세 이미지 추가 및 목록 영역 */}
                <div className="detail_upload_area">
                  <p className="row_desc">추가 이미지 (최대 10장 / 파일을 드래그하여 업로드하세요)</p>
                  <div className="detail_grid">
                    {/* 추가 버튼 / 드래그 앤 드롭 존 */}
                    <label
                      className={`upload_box add_btn ${isDetailDragging ? "dragging" : ""}`}
                      onDragOver={handleDragOver}
                      onDragEnter={() => setIsDetailDragging(true)}
                      onDragLeave={() => setIsDetailDragging(false)}
                      onDrop={handleDetailDrop}
                    >
                      <input
                        // type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => previewDetails(e.target.files)}
                        style={{ display: "none" }}
                      />
                      <span className="upload_placeholder">+ 사진 추가 / 드래그</span>
                    </label>

                    {/* 기존 서버에 등록된 상세 이미지 목록 출력, 삭제 */}
                    {existingDetailImgs.map((img, idx) => (
                      <div className="upload_img_item upload_img" key={`existing-${idx}`}>
                        <img src={img.full_url} alt={`기존 사진 ${idx}`} />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => {
                            handleRemoveExistingDetailImg(idx);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    ))}

                    {/* 새로 첨부된 상세 이미지 목록 출력 */}
                    {newDetailFiles.map((item, idx) => (
                      <div className="upload_img_item upload_img" key={`new-${idx}`}>
                        <img src={item.preview} alt={`신규 사진 ${idx}`} />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => handleRemoveNewDetailFile(idx)}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* 3-6. 하단 저장 / 취소 버튼 */}
            <div className="row row5">
              <div className="btn_con">
                <button type="button" className="btns apply" onClick={handleSubmit}>
                  <span>{isEditMode ? "매물 수정" : "매물 등록"}</span>
                </button>
                <div className="btns exit">
                  <span>
                    <Link to="/property">취소</Link>
                  </span>
                </div>
              </div>
            </div>

          </form>
        </div>
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

export default Property_form;