import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_set, minus_list, plus_del, plus_list, replace_list } from "../../store";
import $ from "jquery";
import post_ajax from "../../ajaxs";
import axios from "axios";

function Set_property(props){

  let [propertySetting, setPropertySetting] = useState();
  let dispatch = useDispatch();
  let store = useSelector((state)=>{return state});
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }
  useMemo(()=>{
    //code=다른 거로 수정해야함, 임시로 map쓰는 중
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Menu/data?code=map', config).then((result)=>{console.log(result); setPropertySetting(result.data.RECORD)}).catch(()=>{alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.'); window.location.href = '/';});
  }, []);

  const menuData = [
    {
      category: "기본 정보",
      items: [
        { id: "item1", label: "매물명", key: "property_name_show" },
        { id: "item2", label: "건물명", key: "building_name_show" },
      ]
    },
    {
      category: "주소 정보",
      items: [
        { id: "item3", label: "시도", key: "addr_sido_show" },
        { id: "item4", label: "시군구", key: "addr_sigungu_show" },
        { id: "item5", label: "읍면동", key: "addr_dong_show" },
        { id: "item6", label: "도로명", key: "addr_road_show" },
      ]
    },
    {
      category: "매물 정보",
      items: [
        { id: "item7", label: "공급면적", key: "supply_area_show" },
        { id: "item8", label: "전용면적", key: "exclusive_area_show" },
        { id: "item9", label: "총층수", key: "total_floors_show" },
        { id: "item10", label: "해당층", key: "current_floor_show" },
        { id: "item11", label: "방수", key: "room_count_show" },
        { id: "item12", label: "욕실수", key: "bathroom_count_show" },
        { id: "item13", label: "주차여부", key: "parking_available_show" },
        { id: "item14", label: "주차대수", key: "parking_count_show" },
        { id: "item15", label: "준공일", key: "completion_date_show" },
        { id: "item16", label: "입주가능일", key: "move_in_date_show" },
        { id: "item17", label: "방향", key: "direction_show" },
        { id: "item18", label: "난방방식", key: "heating_type_show" },
        { id: "item19", label: "난방연료", key: "heating_fuel_show" },
      ]
    },
    {
      category: "가격 정보",
      items: [
        { id: "item20", label: "매매가", key: "sale_price_show" },
        { id: "item21", label: "전세가", key: "jeonse_price_show" },
        { id: "item22", label: "보증금", key: "deposit_price_show" },
        { id: "item23", label: "월세", key: "monthly_rent_show" },
        { id: "item24", label: "융자금", key: "loan_amount_show" },
        { id: "item25", label: "관리비", key: "maintenance_fee_show" },
      ]
    },
    {
      category: "기타 정보",
      items: [
        { id: "item26", label: "거래상태", key: "status_show" },
        { id: "item27", label: "노출상태", key: "display_yn_show" },
        { id: "item28", label: "한줄소개", key: "summary_show" },
        { id: "item29", label: "상세설명", key: "description_show" },
        { id: "item30", label: "대표이미지", key: "thumbnail_image_show" },
        { id: "item31", label: "추가이미지", key: "detail_images_show" },
      ]
    }
  ];

  console.log(propertySetting);
  if(propertySetting){
    return(
      <form id="propertySetting" data-whats="property">
        <div className="row row1">
          <div className="title_con">
            <h4>매물관리 페이지 설정</h4>
          </div>
          <div className="btn_con">
            <div className="btns temporary" onClick={()=>{
              if(window.confirm('기본 설정을 초기화 시키시겠습니까?\n초기화 후 저장하여 홈페이지에 적용하시기 바랍니다.')){
                $("input[type='text']").val('');
                $("input[type='checkbox']").prop('checked', true);
                $("input[name='main_menu_color']").val('#ffffff');
                $("input[name='sub_menu_color']").val('#E72D2B');
                // $(".tit_menu").css({'color' : '#ffffff'});
                // $(".tit_menu").css({'background' : '#EBEFF2'});
                // $(".tit_menu.point").css({'background' : '#E72D2B'});
                // $(".tit_menu.point").css({'color' : '#fff'});
              }
            }}>
              <span>초기화</span>
            </div>
            <div className="btns apply" onClick={()=>{
                const this_form = $("form").attr("id");
                let whats = $("form").attr("data-whats");
                if(window.confirm('저장하시겠습니까?')){
                  post_ajax(this_form, whats, config);
                  dispatch(change_set(0));
                }
              }}>
              <span>저장하기</span>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="setting-container">
            {menuData.map((column, index) => (
              <div className="setting-card" key={index}>
                {/* 상단 회색 제목 영역 */}
                <div className="card-header">
                  <h5>{column.category}</h5>
                </div>

                {/* 하단 항목 리스트 영역 */}
                <div className="card-body">
                  {column.items.map((item) => (
                    <div className="setting-item" key={item.id}>
                      <p className="item-label">{item.label}</p>
                      <div className="check_con">
                        <label>
                          <input
                            className="input_check_hidden"
                            name={item.key}
                            type="hidden"
                            value='N'
                          />
                          <input
                            className="check_menu input_check"
                            name={item.key}
                            type="checkbox"
                            value='Y'
                            defaultChecked={propertySetting[item.key] === "Y" ? true : false}
                          />
                          <div className="check_btn">
                            <span className="disabled">숨김</span>
                            <span className="abled">보임</span>
                            <div className="circle"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </form>
    )
  }

}

export default Set_property