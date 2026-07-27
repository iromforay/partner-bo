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

  useEffect(()=>{
    axios.get(
      process.env.REACT_APP_API_KEY+'Admin/FunctionMenu/data',
      config
    )
    .then((result)=>{
      setPropertySetting(result.data.RECORD);
    })
    .catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시후 다시 시도해주세요.');
      // window.location.href='/';
    });

  },[]);

  //메뉴 카테고리명
  const category = {
    "기본 정보": ["property_name", "building_name"],
    "주소 정보": ["addr_sido", "addr_sigungu", "addr_dong", "addr_road"],
    "매물 정보": [
      "supply_area",
      "exclusive_area",
      "total_floor",
      "current_floor",
      "room_count",
      "bathroom_count",
      "parking_available",
      "parking_count",
      "completion_date",
      "move_in_date",
      "direction",
      "heating_type",
      "heating_fuel",
    ],
    "가격 정보": [
      "sale_price",
      "jeonse_price",
      "deposit_price",
      "monthly_rent",
      "loan_amount",
      "maintenance_fee",
    ],
    "기타 정보": [
      "status",
      "display_yn",
      "summary",
      "description",
      "thumbnail_image",
      "detail_images",
    ],
  };

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
            {Object.entries(category).map(([categoryName, keys]) => (
              <div className="setting-card" key={categoryName}>
                <div className="card-header">
                  <h5>{categoryName}</h5>
                </div>

                <div className="card-body">
                  {propertySetting
                    .filter(item => keys.includes(item.function_menu_key))
                    .map(item => (
                      <div className="setting-item" key={item.function_menu_no}>
                        <p className="item-label">{item.function_menu_name}</p>

                        <div className="check_con">
                          <label>
                            <input
                              className="input_check_hidden"
                              name={item.function_menu_key}
                              type="hidden"
                              value="N"
                            />

                            <input
                              className="check_menu input_check"
                              name={item.function_menu_key}
                              type="checkbox"
                              value="Y"
                              defaultChecked={item.function_menu_value === "Y"}
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