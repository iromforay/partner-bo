import React, { useState } from "react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DaumPostcode from 'react-daum-postcode';

/* ==========================================
   주소 검색 팝업 모달
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

    onComplete({
      sido: data.sido,
      sigungu: data.sigungu,
      bname: data.bname,
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
   메인 매물 등록 컴포넌트 (Write_brd 구조 완전 이식)
   ========================================== */
function Write_property() {
  const navigate = useNavigate();

  const login_key = window.localStorage.getItem('login_key');
  const config = {
    headers: {
      'Authorization': `Bearer ${login_key}`
    }
  };

  // 1. 주소 및 에디터용 최소 State (화면 UI 갱신용)
  const [addrData, setAddrData] = useState({
    sido: '', sigungu: '', dong: '', road: '', lat: '', lng: ''
  });
  const [description, setDescription] = useState('');

  // 2. 이미지 미리보기 및 파일 State
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [upload_thumb_img, setUploadThumbImg] = useState('');

  const [detailFiles, setDetailFiles] = useState([]);
  const [upload_detail_imgs, setUploadDetailImgs] = useState([]);

  // 주소 모달 열림 여부
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

  // 상세 이미지 미리보기
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

  // 주소 선택 시 처리 (카카오 지도 좌표 추출)
  const handleAddressComplete = (data) => {
    let latVal = '';
    let lngVal = '';

    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(data.roadAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK) {
          latVal = result[0].y;
          lngVal = result[0].x;
        }
        setAddrData({
          sido: data.sido,
          sigungu: data.sigungu,
          dong: data.bname,
          road: data.roadAddress,
          lat: latVal,
          lng: lngVal
        });
      });
    } else {
      setAddrData({
        sido: data.sido,
        sigungu: data.sigungu,
        dong: data.bname,
        road: data.roadAddress,
        lat: '',
        lng: ''
      });
    }
    setIsOpenPostcode(false);
  };

  /* ==========================================
     Submit 함수 (Write_brd와 100% 동일한 방식)
     ========================================== */
  const handleSubmit = () => {
    const this_form = document.getElementById("propertyWriteForm");

    // 유효성 검사 (Write_brd 스타일)
    if (!this_form.property_name.value.trim()) {
      alert("매물명을 입력해주세요.");
      this_form.property_name.focus();
      return;
    }

    if (!window.confirm("매물을 등록하시겠습니까?")) return;

    // Write_brd처럼 DOM Form 요소를 통째로 긁어옴!
    const formData = new FormData(this_form);

    // Quill 에디터 본문 및 파일 첨부 (HTML Form 외부 요소들 추가)
    formData.append('description', description);

    if (thumbnailFile) {
      formData.append('thumbnail_image', thumbnailFile);
    }

    detailFiles.forEach((file) => {
      formData.append('detail_images[]', file);
    });

    // 디버깅용 전송 파라미터 콘솔 출력
    for (let [key, value] of formData.entries()) {
      console.log(`key는 ${key}:`, value);
    }
console.log(process.env.REACT_APP_API_KEY + 'Admin/Board/save');
console.log(process.env.REACT_APP_API_KEY + 'Admin/Property/save');
    // 서버 전송
    axios.post(`${process.env.REACT_APP_API_KEY}Admin/Property/save`, formData, config)
      .then((res) => {
        console.log("등록 성공:", res);
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
                  <select name="property_type" defaultValue="apartment">
                    <option value="apartment">아파트</option>
                    <option value="officetel">오피스텔</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래방식</label>
                  <select name="trade_type" defaultValue="매매">
                    <option value="매매">매매</option>
                    <option value="전세">전세</option>
                    <option value="월세">월세</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>거래상태</label>
                  <select name="status" defaultValue="1">
                    <option value="1">거래가능</option>
                    <option value="2">거래중</option>
                    <option value="3">거래완료</option>
                    <option value="4">거래보류</option>
                    <option value="5">비공개</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>노출여부</label>
                  <select name="display_yn" defaultValue="1">
                    <option value="1">노출</option>
                    <option value="2">숨김</option>
                  </select>
                </div>
              </div>

              <div className="grid_row col2">
                <div className="form_group">
                  <label>매물명</label>
                  <input type="text" name="property_name" placeholder="매물명 입력" />
                </div>
                <div className="form_group">
                  <label>건물명</label>
                  <input type="text" name="building_name" placeholder="건물명 입력" />
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
              
              {/* 주소 정보 및 숨겨진 좌표 input */}
              <input type="hidden" name="lat" value={addrData.lat} />
              <input type="hidden" name="lng" value={addrData.lng} />

              <div className="grid_row col4">
                <div className="form_group">
                  <label>주소(시도)</label>
                  <input type="text" name="addr_sido" value={addrData.sido} readOnly placeholder="시/도" />
                </div>
                <div className="form_group">
                  <label>주소(시군구)</label>
                  <input type="text" name="addr_sigungu" value={addrData.sigungu} readOnly placeholder="시/군/구" />
                </div>
                <div className="form_group">
                  <label>주소(읍면동)</label>
                  <input type="text" name="addr_dong" value={addrData.dong} readOnly placeholder="읍/면/동" />
                </div>
                <div className="form_group">
                  <label>좌표 정보</label>
                  <div className="dashed_box">
                    {addrData.lat && addrData.lng 
                      ? `위도: ${addrData.lat} / 경도: ${addrData.lng}` 
                      : '위도/경도 (자동산출)'}
                  </div>
                </div>
              </div>

              <div className="grid_row col2">
                <div className="form_group">
                  <label>도로명주소</label>
                  <input type="text" name="addr_road" value={addrData.road} readOnly placeholder="도로명 주소" />
                </div>
                <div className="form_group">
                  <label>상세주소</label>
                  <input type="text" name="" placeholder="상세 주소 입력 (동/호수 등)" />
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
                  <input type="number" name="supply_area" placeholder="0" />
                </div>
                <div className="form_group">
                  <label>전용면적 (㎡)</label>
                  <input type="number" name="exclusive_area" placeholder="0" />
                </div>
                <div className="form_group">
                  <label>총 층수</label>
                  <div className="flex_inputs">
                    <input type="number" name="total_floor" placeholder="총층" />
                  </div>
                </div>
                <div className="form_group">
                  <label>해당 층</label>
                  <input type="number" name="current_floor" placeholder="해당층" />
                </div>
                <div className="form_group">
                  <label>방수</label>
                  <input type="number" name="room_count" placeholder="방" />
                </div>
                <div className="form_group">
                  <label>욕실수</label>
                  <input type="number" name="bathroom_count" placeholder="욕실" />
                </div>
                <div className="form_group">
                  <label>주차 가능</label>
                    <select name="parking_available" defaultValue="Y">
                      <option value="Y">가능</option>
                      <option value="N">불가</option>
                    </select>
                </div>
                <div className="form_group">
                  <label>대수</label>
                  <input type="number" name="parking_count" placeholder="대수" />
                </div>
                <div className="form_group">
                  <label>준공일</label>
                  <input type="date" name="completion_date" />
                </div>

                <div className="form_group">
                  <label>입주가능일</label>
                  <input type="date" name="move_in_date" />
                </div>             
                <div className="form_group">
                  <label>방향</label>
                  <select name="direction" defaultValue="S">
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
                  <select name="heating_fuel" defaultValue="1">
                    <option value="1">도시가스</option>
                    <option value="2">전기</option>
                    <option value="3">LPG</option>
                    <option value="4">기름</option>
                    <option value="9">기타</option>
                  </select>
                </div>
                <div className="form_group">
                  <label>난방방식</label>
                  <select name="heating_type" defaultValue="1">
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
                  <input type="number" name="sale_price" placeholder="0" />
                </div>
                <div className="form_group">
                  <label>전세가 (만원)</label>
                  <input type="number" name="jeonse_price" placeholder="0" />
                </div>
                <div className="form_group">
                  <label>보증금</label>
                  <input type="number" name="deposit_price" placeholder="보증금" />
                </div>
                <div className="form_group">
                  <label>월세 (만원)</label>
                  <input type="number" name="monthly_rent" placeholder="월세" />
                </div>
                <div className="form_group">
                  <label>융자금</label>
                  <input
                    type="number"
                    name="loan_amount"
                    placeholder="0"
                  />
                </div>
                <div className="form_group">
                  <label>관리비 (만원)</label>
                  <input type="number" name="maintenance_fee" placeholder="0" />
                </div>
              </div>

              <div className="grid_row full">
                <div className="form_group">
                  <label>한줄소개</label>
                  <input type="text" name="summary" placeholder="리스트에 노출될 요약 문구를 입력하세요." />
                </div>
              </div>
              <div>
                <div className="form_group">
                  <label>상세설명</label>
                  <ReactQuill 
                    modules={modules} 
                    value={description} 
                    onChange={setDescription} 
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