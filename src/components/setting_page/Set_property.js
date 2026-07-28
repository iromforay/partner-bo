import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";

import { change_set, minus_list, plus_del, plus_list, replace_list } from "../../store";
import $ from "jquery";
import post_ajax from "../../ajaxs";
import axios from "axios";
import del_img from './del_fn';

function Set_property(props){
  let [propertySetting, setPropertySetting] = useState({
    row: {
      bgcolor: "#f5f5f5",
      transparent: 0
    },
    img: null
  });//배경
  let [functionMenuSetting, setFunctionMenuSetting] = useState();//메뉴

  let [contents, setContents] = useState("");
  let [upload_logo_img, setUpload] = useState('');
  let dispatch = useDispatch();
  let store = useSelector((state)=>{return state});
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  // useEffect(()=>{
  //   if(propertySetting){
  //     setContents(propertySetting.row.title);
  //     if(propertySetting.img !== null){
  //       setUpload(propertySetting.img[0].full_url);
  //     }
  //   }
  // }, [propertySetting])

useEffect(()=>{

  // 배경 설정
  // axios.get(
  //   process.env.REACT_APP_API_KEY+'Admin/Menu/data?code=property',
  //   config
  // )
  // .then((result)=>{
  //   console.log("property 배경:", result.data);
  //   setPropertySetting(result.data.RECORD);
  // });


  // 메뉴 설정
  axios.get(
    process.env.REACT_APP_API_KEY+'Admin/FunctionMenu/data',
    config
  )
  .then((result)=>{
    console.log("function menu:", result.data);
    setFunctionMenuSetting(result.data.RECORD);
  });


},[]);

  function preview(input){
    if (input.length !== 0) {
      console.log(input);
      var reader = new FileReader();
      reader.onload = function(e) {
        setUpload(e.target.result);
      };
      reader.readAsDataURL(input[0]);
    } else {
      return;
    }
  }

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
  
  if(propertySetting && functionMenuSetting){
    return(
      <div id="propertySet">
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
                  // 배경 저장
                  post_ajax(
                    "propertyBackground",
                    "menu",
                    config
                  );

                  // 메뉴 저장
                  post_ajax(
                    "propertySetting",
                    "property",
                    config
                  );
                  dispatch(change_set(0));
                }
              }}>
              <span>저장하기</span>
            </div>
          </div>
        </div>
        <form id="propertyBackground" data-whats="menu">
          <div className="row row2">
            <div className="title_con">
              <h5>배경 설정 (선택)</h5>
            </div>
            <p className="row_desc">해당페이지 배경 이미지와 색을 설정해주세요 / 이미지, 배경색 순으로 나타납니다. / 미입력시 기본값으로 적용</p>
            <div className="inner_con">
              <div className="input_con img_input">
                <label>
                  <input type="file" name="file" onChange={(e)=>{
                    preview(e.target.files);
                    if(propertySetting.img !== null){
                      del_img(propertySetting.img, config);
                    }
                  }} accept="image/png, image/jpeg"></input>
                  <div className="upload_img">
                    {upload_logo_img === '' ? <img src="img/basic/notice/notice_base.jpg"></img> : <img src={upload_logo_img} alt="이미지 경로를 확인해주세요"></img>}
                  </div>
                </label>
                {
                  upload_logo_img === '' ? null : <div className="del_slide" onClick={()=>{
                    if(propertySetting.img !== null){
                      del_img(propertySetting.img, config);
                    }
                    setUpload('');
                  }}>
                    <FontAwesomeIcon icon={faTrashCan}/>
                  </div>
                }
                <div className="ex_con">
                  <p className="row_desc">결과예시)</p>
                  <img src="img/basic/notice/bgEx2.jpg"></img>
                </div>
              </div>
              <div className="opa_con">
                <div className="opacity_con">
                  <input type="color" name="bgcolor" className="clr_input" defaultValue={propertySetting.row?.bgcolor || "#f5f5f5"}></input>
                  <div className="range_con">
                    <input type="range" name="transparent" className="opacity_input" min={0} max={100} defaultValue={propertySetting.row?.transparent || 0} onChange={(e)=>{
                      let val = e.target.value;
                      $(".opa span").text(val+"%")
                    }}></input>
                    <p className="opa"><span>{propertySetting.row.transparent}%</span>배경색 투명도</p>
                  </div>
                </div>
                <div className="ex_con">
                  <p className="row_desc">결과예시)</p>
                  <img src="img/basic/notice/bgEx1.jpg"></img>
                </div>
              </div>
            </div>
          </div>
        </form>

        <form id="propertySetting" data-whats="property">
          <div className="row">
            <div className="setting-container">
              {Object.entries(category).map(([categoryName, keys]) => (
                <div className="setting-card" key={categoryName}>
                  <div className="card-header">
                    <h5>{categoryName}</h5>
                  </div>

                  <div className="card-body">
                    {functionMenuSetting
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
      </div>
    )
  }

}

export default Set_property;