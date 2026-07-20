import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
// import DaumPostcode from "react-daum-postcode";

// 💡 백엔드 연결 실패 시 사용할 퍼블리싱용 더미 데이터
const MOCK_DATA = {
  property_no: "1",
  property_type: "apt",
  trade_type: "매매",
  status: "1",
  display_yn: "1",
  property_name: "더미데이터",
  building_name: "반포자이",
  addr_sido: "서울특별시",
  addr_sigungu: "서초구",
  addr_dong: "반포동",
  addr_road: "서울특별시 서초구 신반포로 270",
  addr_detail: "104동 1203호",
  lat: 37.5056,
  lng: 127.0125,
  supply_area: "115.7",
  exclusive_area: "84.9",
  total_floor: "30",
  current_floor: "12",
  room_count: "3",
  bathroom_count: "2",
  parking_available: "Y",
  parking_count: "2",
  completion_date: "2018-05-20",
  move_in_date: "즉시입주",
  direction: "S",
  heating_fuel: "1",
  heating_type: "3",
  sale_price: "250000", // 25억
  jeonse_price: "0",
  deposit_price: "0",
  monthly_rent: "0",
  loan_amount: "30000",
  maintenance_fee: "25",
  summary: "채광과 조망이 우수한 로얄층 로얄동 매물입니다.",
  description: `
    <p><strong>[매물 상세 설명]</strong></p>
    <p>1. 단지 내 최고 선호 동이며, 올확장형으로 넓은 실내 공간을 자랑합니다.
    2. 지하철역 도보 3분 거리의 초역세권 단지입니다.
    3. 커뮤니티 시설(수영장, 피트니스, 독서실 등) 이용이 편리합니다.</p>
  `,
  thumbnail_image: "https://via.placeholder.com/600x400/3b82f6/ffffff?text=Main+Thumbnail",
  detail_images: [
    "https://via.placeholder.com/400x300/e2e8f0/475569?text=Detail+Img+1",
    "https://via.placeholder.com/400x300/e2e8f0/475569?text=Detail+Img+2",
    "https://via.placeholder.com/400x300/e2e8f0/475569?text=Detail+Img+3"
  ]
};

function Property_detail() {
  const { property_no } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const login_key = window.localStorage.getItem('login_key');
  const config = {
    headers: {
      'Authorization': `Bearer ${login_key}`
    }
  };

  let url = `${process.env.REACT_APP_API_KEY}API/Property/detail?property_no=${property_no}`;

  useEffect(() => {
    axios
      .get(url, config)
      .then((result) => {
        setData(result.data.RECORD.rows);
      })
      .catch((err) => {
        console.error(err);
        setData(MOCK_DATA); // 백엔드 연결 실패 시 더미 데이터 사용
      })
      .finally(() => {
        setLoading(false);
      });
  }, [property_no]);

  // 코드값 매핑 객체
  const propertyTypeMap = {
    apt: "아파트",
    villa: "빌라/연립",
    house: "주택",
    commercial: "상가",
    office: "사무실",
    land: "토지",
    factory: "공장/창고",
    etc: "기타", 
  };
  const statusMap = { "1": "거래가능", "2": "거래중", "3": "거래완료", "4": "거래보류", "5": "비공개" };
  const directionMap = { S: "남향", SE: "남동향", SW: "남서향", E: "동향", W: "서향", N: "북향", NE: "북동향", NW: "북서향" };
  const heatingFuelMap = { "1": "도시가스", "2": "전기", "3": "LPG", "4": "기름", "9": "기타" };
  const heatingTypeMap = { "1": "개별난방", "2": "중앙난방", "3": "지역난방" };

 if(loading){
    return (
    <div className="sections view property_view">
      <div className="width_con">
        <div className="loading_box" style={{ padding: '100px 0', textAlign: 'center' }}>
          <p>데이터를 불러오는 중입니다...</p>
        </div>
      </div>
    </div>
    );
  }
  return (
    <div className="sections write property_write view property_view">
      <div className="width_con">
        <h3>매물 상세 보기</h3>
        <div className="form_con">

          {/* 1. 기본정보 */}
          <div className="section_box">
            <div className="sec_title_bar">
              <h4>기본정보</h4>
            </div>
            <div className="grid_row col4">
              <div className="form_group">
                <label>매물종류</label>
                <div className="view_text">{propertyTypeMap[data.property_type] || data.property_type || "-"}</div>
              </div>
              <div className="form_group">
                <label>거래방식</label>
                <div className="view_text">{data.trade_type || "-"}</div>
              </div>
              <div className="form_group">
                <label>거래상태</label>
                <div className="view_text">{data.status_txt || "-"}</div>
              </div>
              <div className="form_group">
                <label>노출여부</label>
                <div className="view_text">{data.display_yn_txt}</div>
              </div>
            </div>

            <div className="grid_row col2">
              <div className="form_group">
                <label>매물명</label>
                <div className="view_text">{data.property_name || "-"}</div>
              </div>
              <div className="form_group">
                <label>건물명</label>
                <div className="view_text">{data.building_name || "-"}</div>
              </div>
            </div>
          </div>

          {/* 2. 위치정보 */}
          <div className="section_box">
            <div className="sec_title_bar">
              <h4>위치정보</h4>
            </div>
            <div className="grid_row col4">
              <div className="form_group">
                <label>주소(시도)</label>
                <div className="view_text">{data.addr_sido || "-"}</div>
              </div>
              <div className="form_group">
                <label>주소(시군구)</label>
                <div className="view_text">{data.addr_sigungu || "-"}</div>
              </div>
              <div className="form_group">
                <label>주소(읍면동)</label>
                <div className="view_text">{data.addr_dong || "-"}</div>
              </div>
              <div className="form_group display_none">
                <label>좌표 정보</label>
                <div className="view_text">
                  {data.lat && data.lng ? `위도: ${data.lat} / 경도: ${data.lng}` : "-"}
                </div>
              </div>
            </div>

            <div className="grid_row col2">
              <div className="form_group">
                <label>도로명주소</label>
                <div className="view_text">{data.addr_road || "-"}</div>
              </div>
              <div className="form_group">
                <label>상세주소</label>
                <div className="view_text">{data.addr_detail || "-"}</div>
              </div>
            </div>

            {/* 지도 박스 */}
            {/* {data.lat && data.lng && (
              <div className="map_area" style={{ marginTop: '15px' }}>
                <div id="map" style={{ width: '100%', height: '280px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}></div>
              </div>
            )} */}
          </div>

          {/* 3. 매물 정보 */}
          <div className="section_box">
            <div className="sec_title_bar">
              <h4>매물 정보</h4>
            </div>
            <div className="grid_row col4">
              <div className="form_group">
                <label>공급면적</label>
                <div className="view_text">{data.supply_area ? `${data.supply_area} ㎡` : "-"}</div>
              </div>
              <div className="form_group">
                <label>전용면적</label>
                <div className="view_text">{data.exclusive_area ? `${data.exclusive_area} ㎡` : "-"}</div>
              </div>
              <div className="form_group">
                <label>총 층수</label>
                <div className="view_text">{data.total_floor ? `${data.total_floor}층` : "-"}</div>
              </div>
              <div className="form_group">
                <label>해당 층</label>
                <div className="view_text">{data.current_floor ? `${data.current_floor}층` : "-"}</div>
              </div>
              <div className="form_group">
                <label>방수</label>
                <div className="view_text">방 {data.room_count || 0}개</div>
              </div>
              <div className="form_group">
                <label>욕실수</label>
                <div className="view_text">욕실 {data.bathroom_count || 0}개</div>
              </div>
              <div className="form_group">
                <label>주차 가능</label>
                <div className="view_text">
                  {data.parking_available === "Y" ? `가능 (${data.parking_count || 0}대)` : "불가"}
                </div>
              </div>
              <div className="form_group">
                <label>준공일</label>
                <div className="view_text">{data.completion_date || "-"}</div>
              </div>
              <div className="form_group">
                <label>입주가능일</label>
                <div className="view_text">{data.move_in_date || "-"}</div>
              </div>
              <div className="form_group">
                <label>방향</label>
                <div className="view_text">{data.direction_txt || "-"}</div>
              </div>
              <div className="form_group">
                <label>난방연료</label>
                <div className="view_text">{data.heating_fuel_txt || "-"}</div>
              </div>
              <div className="form_group">
                <label>난방방식</label>
                <div className="view_text">{data.heating_type_txt || "-"}</div>
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
                <label>매매가</label>
                <div className="view_text">{data.sale_price ? `${Number(data.sale_price).toLocaleString()} 만원` : "-"}</div>
              </div>
              <div className="form_group">
                <label>전세가</label>
                <div className="view_text">{data.jeonse_price ? `${Number(data.jeonse_price).toLocaleString()} 만원` : "-"}</div>
              </div>
              <div className="form_group">
                <label>보증금 / 월세</label>
                <div className="view_text">
                  {data.deposit_price || data.monthly_rent 
                    ? `${Number(data.deposit_price || 0).toLocaleString()} / ${Number(data.monthly_rent || 0).toLocaleString()} 만원` 
                    : "-"}
                </div>
              </div>
              <div className="form_group">
                <label>융자금</label>
                <div className="view_text">
                  {data.loan_amount ? `${Number(data.loan_amount).toLocaleString()}만원` : "없음"}
                </div>
              </div>
              <div className="form_group">
                <label>관리비</label>
                <div className="view_text">
                  {data.maintenance_fee ? `${Number(data.maintenance_fee).toLocaleString()}만원` : "없음"}
                </div>
              </div>
            </div>

            <div className="grid_row full">
              <div className="form_group">
                <label>한줄소개</label>
                <div className="view_text">{data.summary || "-"}</div>
              </div>
            </div>

            <div className="grid_row full">
              <div className="form_group">
                <label>상세설명</label>
                <div 
                  className="row4" 
                  dangerouslySetInnerHTML={{ __html: data.description || "등록된 상세설명이 없습니다." }} 
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
                <div className="upload_img_item">
                  {data.thumbnail_image ? (
                    <img src={data.thumbnail_image} alt="대표 이미지" />
                  ) : (
                    <p className="no_img">등록된 대표 사진이 없습니다.</p>
                  )}
                </div>
              </div>

              {/* 상세 이미지 목록 */}
              <div className="detail_upload_area" style={{ marginTop: '20px' }}>
                <p className="row_desc">추가 이미지</p>
                <div className="detail_grid">
                  {data.detail_images && data.detail_images.length > 0 ? (
                    data.detail_images.map((imgUrl, idx) => (
                      <div className="upload_img_item" key={idx}>
                        <img src={typeof imgUrl === 'object' ? imgUrl.url : imgUrl} alt={`상세 이미지 ${idx + 1}`} />
                      </div>
                    ))
                  ) : (
                    <p className="no_img">등록된 추가 사진이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 하단 버튼 바 */}
          <div className="row row5">
            <div className="btn_con">
              <button 
                type="button" 
                className="btns apply" 
                onClick={() => navigate(`/property/edit/${data.property_no}`)}
              >
                <span>수정하기</span>
              </button>
              <div className="btns exit">
                <span><Link to='/property'>목록으로</Link></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Property_detail;