import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DaumPostcode from 'react-daum-postcode';

/* ==========================================
   주소 검색 팝업 모달 컴포넌트
   ========================================== */
function AddressSearchModal({ onComplete, onClose }) {
  const handleComplete = (data) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') {
        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    // 시도, 시군구, 읍면동, 도로명주소 분할 데이터 추출
    onComplete({
      sido: data.sido,
      sigungu: data.sigungu,
      bname: data.bname, // 읍면동
      roadAddress: data.roadAddress,
      zonecode: data.zonecode
    });
  };

  return (
    <div className="modal_overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', position: 'relative' }}>
        <button onClick={onClose} style={{ float: 'right', cursor: 'pointer', border: 'none', background: 'none', fontWeight: 'bold' }}>X 닫기</button>
        <h4 style={{ marginBottom: '15px', fontSize: '18px', fontWeight: 'bold' }}>주소 검색</h4>
        <DaumPostcode onComplete={handleComplete} />
      </div>
    </div>
  );
}

/* ==========================================
   메인 매물 등록 컴포넌트
   ========================================== */
function Write_property() {
  const navigate = useNavigate();

  const login_key = window.localStorage.getItem('login_key');
  const config = {
    headers: {
      'Authorization': `Bearer ${login_key}`
    }
  };

  const [formData, setFormData] = useState({
    propertyType: 'apartment',
    tradeType: '매매',
    tradeStatus: '1',
    display_yn: '1',
    property_name: '',
    building_name: '',
    addr_sido: '',
    addr_sigungu: '',
    addr_dong: '',
    addr_road: '',
    addr_detail: '',
    lat: '',
    lng: '',
    supply_area: '',
    exclusive_area: '',
    total_floor: '',
    current_floor: '',
    room_count: '',
    bathroom_count: '',
    parking_available: 'Y',
    parking_count: '',
    completion_date: '',
    move_in_date: '',
    direction: 'S',
    heating_fuel: '1',
    heating_type: '1',
    sale_price: '',
    jeonse_price: '',
    deposit_price: '',
    monthly_rent: '',
    loan_amount: '',
    maintenance_fee: '',
    summary: '',
    description: ''
  });

  // 대표 이미지 상태
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [upload_thumb_img, setUploadThumbImg] = useState('');

  // 추가 이미지 (배열) 상태
  const [detailFiles, setDetailFiles] = useState([]);
  const [upload_detail_imgs, setUploadDetailImgs] = useState([]);

  // 주소 모달 상태
  const [isOpenPostcode, setIsOpenPostcode] = useState(false);

  // 대표 이미지 미리보기
  const previewThumb = (files) => {
    if (files && files.length > 0) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadThumbImg(e.target.result);
      };
      reader.readAsDataURL(files[0]);
      setThumbnailFile(files[0]);
    }
  };

  // 추가 이미지 다중 미리보기
  const previewDetails = (files) => {
    if (files && files.length > 0) {
      const fileArray = Array.from(files);

      if (detailFiles.length + fileArray.length > 10) {
        alert("추가 이미지 : 최대 10장까지 선택 가능합니다.");
        return;
      }

      setDetailFiles((prev) => [...prev, ...fileArray]);

      fileArray.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setUploadDetailImgs((prev) => [...prev, e.target.result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 검색 완료 및 위경도(Geocoding) 추출 핸들러
  const handleAddressComplete = (addrData) => {
    let latVal = '';
    let lngVal = '';

    // 카카오 스크립트가 로드되어 있는 경우 주소->좌표 변환
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(addrData.roadAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          latVal = result[0].y;
          lngVal = result[0].x;
        }
        setFormData(prev => ({
          ...prev,
          addr_sido: addrData.sido,
          addr_sigungu: addrData.sigungu,
          addr_dong: addrData.bname,
          addr_road: addrData.roadAddress,
          lat: latVal,
          lng: lngVal
        }));
      });
    } else {
      // GeoCoder가 없을 경우 주소만 세팅
      setFormData(prev => ({
        ...prev,
        addr_sido: addrData.sido,
        addr_sigungu: addrData.sigungu,
        addr_dong: addrData.bname,
        addr_road: addrData.roadAddress
      }));
    }
    setIsOpenPostcode(false);
  };

  const handleSubmit = () => {
    if (!formData.property_name.trim()) {
      alert("매물명을 입력해주세요.");
      return;
    }

    if (!window.confirm("매물을 등록하시겠습니까?")) return;

    const sendFormData = new FormData();

    Object.keys(formData).forEach((key) => {
      sendFormData.append(key, formData[key] ?? '');
    });

    if (thumbnailFile) {
      sendFormData.append('thumbnail_image', thumbnailFile);
    }

    detailFiles.forEach((file) => {
      sendFormData.append('detail_images[]', file);
    });

    axios.post(`${process.env.REACT_APP_API_KEY}Admin/Property/save`, sendFormData, config)
      .then((res) => {
        alert('매물이 등록되었습니다.');
        navigate('/property');
      })
      .catch((err) => {
        console.error("매물 등록 실패:", err);
        alert("데이터 전송이 실패하였습니다.");
      });
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };

  return (
    <div className="sections write property_write">
      <div className="width_con">
        <h3>매물 등록</h3>
        <div className="form_con">
          <form id="propertyWriteForm" onSubmit={(e) => e.preventDefault()}>

            {/* 1. 기본정보 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>기본정보</h4>
              </div>

              <div className="grid_row col4">
                <div className="form_group">
                  <label>매물종류</label>
                  <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                    <option value="apartment">아파트</option>
                    <option value="officetel">오피스텔</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래방식</label>
                  <select name="tradeType" value={formData.tradeType} onChange={handleChange}>
                    <option value="매매">매매</option>
                    <option value="전세">전세</option>
                    <option value="월세">월세</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래상태</label>
                  <select name="tradeStatus" value={formData.tradeStatus} onChange={handleChange}>
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
                  <input type="text" name="property_name" value={formData.property_name} onChange={handleChange} placeholder="매물명 입력" />
                </div>
                <div className="form_group">
                  <label>건물명</label>
                  <input type="text" name="building_name" value={formData.building_name} onChange={handleChange} placeholder="건물명 입력" />
                </div>
              </div>
            </div>

            {/* 2. 위치정보 */}
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
                <div className="form_group">
                  <label>좌표 정보</label>
                  <div className="dashed_box">
                    {formData.lat && formData.lng 
                      ? `${formData.lat} / ${formData.lng}` 
                      : '위도/경도 (자동산출)'}
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
                  <input type="text" name="addr_detail" value={formData.addr_detail} onChange={handleChange} placeholder="상세 주소 입력 (동/호수 등)" />
                </div>
              </div>
            </div>

            {/* 3. 매물 정보 */}
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
                  <label>총 층수 / 해당 층</label>
                  <div className="flex_inputs">
                    <input type="number" name="total_floor" placeholder="총층" value={formData.total_floor} onChange={handleChange} />
                    <span>/</span>
                    <input type="number" name="current_floor" placeholder="해당층" value={formData.current_floor} onChange={handleChange} />
                  </div>
                </div>
                <div className="form_group">
                  <label>방수 / 욕실수</label>
                  <div className="flex_inputs">
                    <input type="number" name="room_count" placeholder="방" value={formData.room_count} onChange={handleChange} />
                    <span>/</span>
                    <input type="number" name="bathroom_count" placeholder="욕실" value={formData.bathroom_count} onChange={handleChange} />
                  </div>
                </div>
                <div className="form_group">
                  <label>주차 가능 여부 / 대수</label>
                  <div className="flex_inputs">
                    <select name="parking_available" value={formData.parking_available} onChange={handleChange}>
                      <option value="Y">가능</option>
                      <option value="N">불가</option>
                    </select>
                    <input type="number" name="parking_count" placeholder="대수" value={formData.parking_count} onChange={handleChange} />
                  </div>
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

            {/* 4. 가격 및 소개 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>가격 및 소개</h4>
              </div>
              <div className="grid_row col4">
                <div className="form_group">
                  <label>매매가 (만원)</label>
                  <input type="number" name="sale_price" value={formData.sale_price} onChange={handleChange} placeholder="0" />
                </div>
                <div className="form_group">
                  <label>전세가 (만원)</label>
                  <input type="number" name="jeonse_price" value={formData.jeonse_price} onChange={handleChange} placeholder="0" />
                </div>
                <div className="form_group">
                  <label>보증금 / 월세 (만원)</label>
                  <div className="flex_inputs">
                    <input type="number" name="deposit_price" placeholder="보증금" value={formData.deposit_price} onChange={handleChange} />
                    <span>/</span>
                    <input type="number" name="monthly_rent" placeholder="월세" value={formData.monthly_rent} onChange={handleChange} />
                  </div>
                </div>
                <div className="form_group">
                  <label>관리비 (만원)</label>
                  <input type="number" name="maintenance_fee" value={formData.maintenance_fee} onChange={handleChange} placeholder="0" />
                </div>
              </div>

              <div className="grid_row full">
                <div className="form_group">
                  <label>한줄소개</label>
                  <input type="text" name="summary" value={formData.summary} onChange={handleChange} placeholder="리스트에 노출될 요약 문구를 입력하세요." />
                </div>
              </div>
              <div className="">
                <div className="form_group">
                  <label>상세설명</label>
                    <ReactQuill 
                      modules={modules} 
                      value={formData.description || ''} 
                      onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))} 
                    />
                </div>
              </div>
            </div>

            {/* 5. 사진 정보 */}
            <div className="section_box">
              <div className="sec_title_bar">
                <h4>사진 정보</h4>
              </div>
              <div className="image_upload_container">
                {/* 대표 이미지 */}
                <div className="thumb_upload_area">
                  <p className="row_desc">대표 이미지</p>
                  <div className="detail_grid">
                    {upload_thumb_img === '' ? (
                      <label className="upload_box add_btn">
                        <input
                          type="file"
                          name="thumbnail_file"
                          accept="image/*"
                          onChange={(e) => previewThumb(e.target.files)}
                          style={{ display: 'none' }}
                        />
                        <span className="upload_placeholder">+ 대표사진 선택</span>
                      </label>
                    ) : (
                      <div className="upload_img_item upload_img">
                        <img src={upload_thumb_img} alt="대표 이미지 미리보기" />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => {
                            setUploadThumbImg('');
                            setThumbnailFile(null);
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 추가 이미지 (최대 10장) */}
                <div className="detail_upload_area">
                  <p className="row_desc">추가 이미지 (최대 10장)</p>
                  <div className="detail_grid">
                    <label className="upload_box add_btn">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => previewDetails(e.target.files)}
                        style={{ display: 'none' }}
                      />
                      <span className="upload_placeholder">+ 사진 추가</span>
                    </label>

                    {upload_detail_imgs.map((imgSrc, idx) => (
                      <div className="upload_img_item upload_img" key={idx}>
                        <img src={imgSrc} alt={`추가 사진 ${idx}`} />
                        <button
                          type="button"
                          className="btn_del_img_overlay"
                          onClick={() => {
                            setUploadDetailImgs((prev) => prev.filter((_, i) => i !== idx));
                            setDetailFiles((prev) => prev.filter((_, i) => i !== idx));
                          }}
                        >
                          <FontAwesomeIcon icon={faTrashCan} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="row row5">
              <div className="btn_con">
                <button type="button" className="btns apply" onClick={handleSubmit}>
                  <span>매물 등록</span>
                </button>
                <div className="btns exit">
                  <span><Link to='/property'>취소</Link></span>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* 주소 검색 모달 */}
      {isOpenPostcode && (
        <AddressSearchModal 
          onComplete={handleAddressComplete} 
          onClose={() => setIsOpenPostcode(false)} 
        />
      )}
    </div>
  );
}

export default Write_property;