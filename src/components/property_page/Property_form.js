import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DaumPostcode from "react-daum-postcode";

/* ==========================================
   주소 검색 팝업 모달
   ========================================== */
function AddressSearchModal({ onComplete, onClose }) {
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") extraAddress += data.bname;
      if (data.buildingName !== "") {
        extraAddress += extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }

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
        <DaumPostcode onComplete={handleComplete} />
      </div>
    </div>
  );
}

/* ==========================================
   매물 등록/수정 통합 컴포넌트 (Property_form)
   ========================================== */
function Property_form() {
  const navigate = useNavigate();
  const { property_no } = useParams();
  
  // ★ property_no가 존재하면 수정 모드, 없으면 등록 모드
  const isEditMode = Boolean(property_no);

  const login_key = window.localStorage.getItem("login_key");
  const config = {
    headers: {
      Authorization: `Bearer ${login_key}`,
    },
  };

  // 건물명 Placeholder 맵핑
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

  // 숫자를 3자리마다 콤마 찍는 함수
  const formatNumber = (numStr) => {
    if (numStr === null || numStr === undefined) return "";
    const cleanNum = numStr.toString().replace(/[^0-9]/g, "");
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("ko-KR");
  };

  // 초기 폼 기본 데이터
  const initialFormState = {
    property_no: "",
    property_type: "apt",
    trade_type: "매매",
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

  const [formData, setFormData] = useState(initialFormState);

  // 대표 이미지 State
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [upload_thumb_img, setUploadThumbImg] = useState("");

  // 상세 이미지 State (기존 URL vs 신규 파일 분리)
  const [existingDetailImgs, setExistingDetailImgs] = useState([]);
  const [newDetailFiles, setNewDetailFiles] = useState([]); // [{ file: File, preview: string }]

  // UI 상태
  const [isThumbDragging, setIsThumbDragging] = useState(false);
  const [isDetailDragging, setIsDetailDragging] = useState(false);
  const [isOpenPostcode, setIsOpenPostcode] = useState(false);

  // 1. [수정 모드일 때만] 기존 데이터 조회
  useEffect(() => {
    if (!isEditMode) return;

    axios
      .get(`${process.env.REACT_APP_API_KEY}API/Property/detail?property_no=${property_no}`, config)
      .then((res) => {
        const data = res.data?.RECORD?.rows?.[0];
        if (data) {
          setFormData({
            property_no: property_no,
            property_type: data.property_type || "apt",
            trade_type: data.trade_type || "매매",
            status: String(data.status || "1"),
            display_yn: String(data.display_yn || "1"),
            property_name: data.property_name || "",
            building_name: data.building_name || "",
            addr_sido: data.addr_sido || "",
            addr_sigungu: data.addr_sigungu || "",
            addr_dong: data.addr_dong || "",
            addr_road: data.addr_road || "",
            addr_detail: data.addr_detail || "",
            lat: data.lat || "",
            lng: data.lng || "",
            supply_area: data.supply_area || "",
            exclusive_area: data.exclusive_area || "",
            total_floor: data.total_floor || "",
            current_floor: data.current_floor || "",
            room_count: data.room_count || "",
            bathroom_count: data.bathroom_count || "",
            parking_available: data.parking_available || "Y",
            parking_count: data.parking_count || "",
            completion_date: data.completion_date || "",
            move_in_date: data.move_in_date || "",
            direction: data.direction || "S",
            heating_fuel: String(data.heating_fuel || "1"),
            heating_type: String(data.heating_type || "1"),
            sale_price: formatNumber(data.sale_price),
            jeonse_price: formatNumber(data.jeonse_price),
            deposit_price: formatNumber(data.deposit_price),
            monthly_rent: formatNumber(data.monthly_rent),
            loan_amount: formatNumber(data.loan_amount),
            maintenance_fee: formatNumber(data.maintenance_fee),
            summary: data.summary || "",
            description: data.description || "",
          });

          setUploadThumbImg(data.thumbnail_image || data.thumbnail_url || "");
          setExistingDetailImgs(data.detail_images || data.detail_image_urls || []);
        }
      })
      .catch((err) => {
        console.error("상세 데이터 조회 실패:", err);
      });
  }, [property_no, isEditMode]);

  // 폼 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 가격 콤마 포맷팅 핸들러
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: formatNumber(value) }));
  };

  // 대표 이미지 프리뷰
  const previewThumb = (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => setUploadThumbImg(e.target.result);
      reader.readAsDataURL(file);
      setThumbnailFile(file);
    }
  };

  // 상세 이미지 추가 프리뷰
  const previewDetails = (files) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      if (existingDetailImgs.length + newDetailFiles.length + fileArray.length > 10) {
        alert("추가 이미지: 최대 10장까지 선택 가능합니다.");
        return;
      }

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewDetailFiles((prev) => [
            ...prev,
            { file: file, preview: e.target.result },
          ]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // 이미지 삭제
  const handleRemoveExistingDetailImg = (index) => {
    setExistingDetailImgs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewDetailFile = (index) => {
    setNewDetailFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleThumbDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsThumbDragging(false);
    if (e.dataTransfer.files?.length) previewThumb(e.dataTransfer.files);
  };

  const handleDetailDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailDragging(false);
    if (e.dataTransfer.files?.length) previewDetails(e.dataTransfer.files);
  };

  // 주소 완료
  const handleAddressComplete = (data) => {
    let latVal = "";
    let lngVal = "";

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

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.roadAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          latVal = result[0].y;
          lngVal = result[0].x;
        }
        updateAddressState(latVal, lngVal);
      });
    } else {
      updateAddressState("", "");
    }
    setIsOpenPostcode(false);
  };

  // 2. 통합 Submit 처리 (등록 vs 수정 분기)
  const handleSubmit = () => {
    if (!formData.property_name.trim()) {
      alert("매물명을 입력해주세요.");
      return;
    }

    const actionText = isEditMode ? "수정" : "등록";
    if (!window.confirm(`매물 정보를 ${actionText}하시겠습니까?`)) return;

    const submitFormData = new FormData();

    // 콤마 제거 후 FormData 바인딩
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

    // 대표 이미지
    if (thumbnailFile) {
      submitFormData.append("thumbnail_image", thumbnailFile);
    }

    // 기존 유지할 상세 이미지 URL (수정 모드 시)
    existingDetailImgs.forEach((url) => {
      submitFormData.append("existing_detail_images[]", url);
    });

    // 새로 추가된 상세 이미지 File 객체
    newDetailFiles.forEach((item) => {
      submitFormData.append("detail_images[]", item.file);
    });

    // ★ API URL 분기
    const apiUrl = isEditMode
      ? `${process.env.REACT_APP_API_KEY}Admin/Property/update`
      : `${process.env.REACT_APP_API_KEY}Admin/Property/insert`;

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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      ["clean"],
    ],
  };

  return (
    <div className="sections write property_write">
      <div className="width_con">
        {/* 타이틀 분기 */}
        <h3>{isEditMode ? "매물 수정" : "매물 등록"}</h3>
        <div className="form_con">
          <form id="propertyForm" onSubmit={(e) => e.preventDefault()}>
            
            {/* 기본정보 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>기본정보</h4>
              </div>
              <div className="grid_row col4">
                <div className="form_group">
                  <label>매물종류</label>
                  <select name="property_type" value={formData.property_type} onChange={handleChange}>
                    <option value="apt">아파트</option>
                    <option value="villa">빌라/연립</option>
                    <option value="house">주택</option>
                    <option value="commercial">상가</option>
                    <option value="office">사무실</option>
                    <option value="land">토지</option>
                    <option value="factory">공장/창고</option>
                    <option value="etc">기타</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래방식</label>
                  <select name="trade_type" value={formData.trade_type} onChange={handleChange}>
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
                  <label>매물명</label>
                  <input
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

            {/* 위치정보 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>위치정보</h4>
                <div className="btn_search btn_addr_search" onClick={() => setIsOpenPostcode(true)}>
                  <span>주소 검색</span>
                </div>
              </div>

              <div className="grid_row col4">
                <div className="form_group">
                  <label>주소(시도)</label>
                  <input type="text" name="addr_sido" value={formData.addr_sido} readOnly placeholder="시/도" />
                </div>
                <div className="form_group">
                  <label>주소(시군구)</label>
                  <input type="text" name="addr_sigungu" value={formData.addr_sigungu} readOnly placeholder="시/군/구" />
                </div>
                <div className="form_group">
                  <label>주소(읍면동)</label>
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

            {/* 매물 정보 */}
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

            {/* 가격 및 소개 */}
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
                  <label>보증금</label>
                  <input type="text" name="deposit_price" placeholder="보증금" value={formData.deposit_price} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>월세 (만원)</label>
                  <input type="text" name="monthly_rent" placeholder="월세" value={formData.monthly_rent} onChange={handlePriceChange} />
                </div>
                <div className="form_group">
                  <label>융자금</label>
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

            {/* 사진 정보 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>사진 정보</h4>
              </div>
              <div className="image_upload_container">
                {/* 대표 이미지 */}
                <div className="thumb_upload_area">
                  <p className="row_desc">대표 이미지 (파일을 드래그하여 업로드하세요)</p>
                  <div className="detail_grid">
                    {upload_thumb_img === "" ? (
                      <label
                        className={`upload_box add_btn ${isThumbDragging ? "dragging" : ""}`}
                        onDragOver={handleDragOver}
                        onDragEnter={() => setIsThumbDragging(true)}
                        onDragLeave={() => setIsThumbDragging(false)}
                        onDrop={handleThumbDrop}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => previewThumb(e.target.files)}
                          style={{ display: "none" }}
                        />
                        <span className="upload_placeholder">+ 대표사진 / 드래그</span>
                      </label>
                    ) : (
                      <div className="upload_img_item upload_img">
                        <img src={upload_thumb_img} alt="대표 미리보기" />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => {
                            setUploadThumbImg("");
                            setThumbnailFile(null);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 추가 이미지 */}
                <div className="detail_upload_area">
                  <p className="row_desc">추가 이미지 (최대 10장 / 파일을 드래그하여 업로드하세요)</p>
                  <div className="detail_grid">
                    <label
                      className={`upload_box add_btn ${isDetailDragging ? "dragging" : ""}`}
                      onDragOver={handleDragOver}
                      onDragEnter={() => setIsDetailDragging(true)}
                      onDragLeave={() => setIsDetailDragging(false)}
                      onDrop={handleDetailDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => previewDetails(e.target.files)}
                        style={{ display: "none" }}
                      />
                      <span className="upload_placeholder">+ 사진 추가 / 드래그</span>
                    </label>

                    {/* 기존 서버 이미지 목록 (수정 모드 시) */}
                    {existingDetailImgs.map((imgUrl, idx) => (
                      <div className="upload_img_item upload_img" key={`existing-${idx}`}>
                        <img src={imgUrl} alt={`기존 사진 ${idx}`} />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => handleRemoveExistingDetailImg(idx)}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    ))}

                    {/* 신규 등록된 이미지 목록 */}
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

            {/* 하단 버튼 분기 */}
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