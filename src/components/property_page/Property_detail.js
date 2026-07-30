import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
// import DaumPostcode from "react-daum-postcode";

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

  let url = `${process.env.REACT_APP_API_KEY}Admin/Property/detail?property_no=${property_no}`;
  const [mapImage, setMapImage] = useState("");

  //상세 데이터 바인딩
  useEffect(() => {
    axios
      .get(
        `${process.env.REACT_APP_API_KEY}Admin/Property/detail?property_no=${property_no}`,
        config
      )
      .then((res) => {

        if (res.data.SUCCESS !== "TRUE") {
          console.error("상세 조회 실패:", res.data.MSG);
          return;
        }

        const data = res.data?.RECORD?.[0];

        console.log("상세 데이터:", data);

        if (!data) {
          console.error("데이터 없음");
          return;
        }

        setData(data);

        // 지도 이미지 추가시
        if (data.lat && data.lng) {
          setMapImage(
            `${process.env.REACT_APP_API_KEY}Admin/Map/image?lat=${data.lat}&lng=${data.lng}`
          );
        }

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

  }, [property_no]);

// 금액 표시 함수 (만원 → 억/만원)
const formatPrice = (price) => {
  if (!price || Number(price) === 0) return "-";

  const num = Number(price);

  const eok = Math.floor(num / 10000);
  const man = num % 10000;

  if (eok > 0 && man > 0) {
    return `${eok}억 ${man.toLocaleString()}만원`;
  }

  if (eok > 0) {
    return `${eok}억`;
  }

  return `${num.toLocaleString()}만원`;
};

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
    <div className="sections write property_section property_section_detail">
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
                <div className="view_text">{data.property_type_txt || "-"}</div>
              </div>
              <div className="form_group">
                <label>거래방식</label>
                <div className="view_text">{data.transaction_type_txt || "-"}</div>
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
              {/* <div className="form_group">
                <label>상세주소</label>
                <div className="view_text">{data.addr_detail || "-"}</div>
              </div> */}
            </div>

            {/* 지도 박스 */}
            {mapImage && (
              <div className="map_preview">
                <label>지도 위치</label>
                <img 
                  src={mapImage}
                  alt="지도 위치"
                />
              </div>
            )}
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
                <div className="view_text">{data.room_count || 0}개</div>
              </div>
              <div className="form_group">
                <label>욕실수</label>
                <div className="view_text">{data.bathroom_count || 0}개</div>
              </div>
              <div className="form_group">
                <label>주차 가능</label>
                <div className="view_text">
                  {data.parking_available === "Y" ? `${data.parking_count || 0}대` : "불가"}
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
                <div className="view_text">
                  {formatPrice(data.sale_price)}
                </div>
              </div>
              <div className="form_group">
                <label>전세가</label>
                <div className="view_text">
                  {formatPrice(data.jeonse_price)}
                </div>
              </div>
              <div className="form_group">
                <label>보증금</label>
                <div className="view_text">
                  {formatPrice(data.deposit_price)}                  
                </div>
              </div>
              <div className="form_group">
                <label>월세</label>
                <div className="view_text">
                  {formatPrice(data.monthly_rent)}
                </div>
              </div>
              <div className="form_group">
                <label>융자금</label>
                <div className="view_text">
                  {formatPrice(data.loan_amount)}
                </div>
              </div>
              <div className="form_group">
                <label>관리비</label>
                <div className="view_text">
                  {data.maintenance_fee 
                    ? `${Number(data.maintenance_fee).toLocaleString()}만원`
                    : "-"
                  }
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
                  {data.main_image_url ? (
                    <div className="upload_img_item">
                      <img src={data.main_image_url} alt="대표 이미지" />
                    </div>
                  ) : (
                    <p className="no_img">등록된 대표 사진이 없습니다.</p>
                  )}
              </div>

              {/* 상세 이미지 목록 */}
              <div className="detail_upload_area" style={{ marginTop: '20px' }}>
                <p className="row_desc">추가 이미지</p>
                <div className="detail_grid">
                  {data.detail_images && data.detail_images.length > 0 ? (
                    data.detail_images.map((img, idx) => (
                      <div className="upload_img_item" key={idx}>
                        <img
                          src={img.full_url}
                          alt={`상세 이미지 ${idx + 1}`}
                        />
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