import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_set } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import $ from "jquery";
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import post_ajax from "../../ajaxs";
import del_img from './del_fn';



function Set_map(){
  let [mapSetting, setMapSetting] = useState();
  let [upload_img, setUpload] = useState('');
  let [upload_img2, setUpload2] = useState('');
  let dispatch = useDispatch();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  useMemo(()=>{
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Menu/data?code=map', config).then((result)=>{setMapSetting(result.data.RECORD); console.log('아작스 통신', result)}).catch(()=>{alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.'); window.location.href = '/';});
  }, []);

  useEffect(()=>{
    if(mapSetting){
      if(mapSetting.img !== null){
        setUpload(mapSetting.img[0].full_url);
      }
      setUpload2(mapSetting.row.file2);
    }
  }, [mapSetting])

  function preview(input, a){
    if (input.length !== 0) {
      console.log(input);
      var reader = new FileReader();
      reader.onload = function(e) {
        if(a === 2){
          setUpload2(e.target.result);
        }else{
          setUpload(e.target.result);
        }
      };
      reader.readAsDataURL(input[0]);
    } else {
      return;
    }
  }

  console.log(mapSetting);
  

  if(mapSetting){
    return(
      <form id="mapSetting" data-whats="map">
        {/* 타이틀/버튼 */}
        <section className="grid">
          <div className="card homepage-set-title-btn">
            <h3>오시는길 페이지 설정</h3>       
            <div className="btn-row">
              <div className="btn btn-muted" onClick={()=>{
                if(window.confirm('오시는길 페이지 설정을 초기화 시키시겠습니까?\n초기화 후 저장하여 홈페이지에 적용하시기 바랍니다.')){
                  $("input[type='text']").val('');
                  $("textarea").val('');
                  $("input[type='checkbox']").prop('checked', true);
                  $("input[name='bgcolor']").val('#f5f5f5');
                  $("input[name='transparent']").val(0);
                  $("#menu_back_transparent").text(0+"%");
                }
              }}>
                <span>초기화</span>
              </div>
              <div className="btn btn-primary" onClick={()=>{
                  const this_form = $("form").attr("id");
                  let whats = $("form").attr("data-whats");
                  if(window.confirm('저장하시겠습니까?')){
                    post_ajax(this_form, whats, config);
                    // dispatch(change_set(0));
                  }
                }}>
                <span>저장하기</span>
              </div>
            </div>
          </div>
        </section>

        {/* 배경이미지 설정 (선택) */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>배경이미지 설정 (선택)</h3>
              <div className="check_con">
                <label>
                  <input className="input_check_hidden" name="bgcolor_show" type="hidden" value='N'></input>
                  <input className="check_menu input_check" name="bgcolor_show" type="checkbox" value="Y" defaultChecked={mapSetting.row.bgcolor_show === "Y" ? true : false}></input>
                  <div className="check_btn">
                    <span className="disabled">숨김</span>
                    <span className="abled">보임</span>
                    <div className="circle"></div>
                  </div>
                </label>
              </div>
            </div>
            <p className="sub">해당페이지 배경 이미지를 설정해주세요. / 이미지, 배경색 순으로 나타납니다. / 미입력시 기본값으로 적용</p>
          
            <div className="bg_img_con">
              <label>
                <input type="file" name="file" accept="image/png, image/jpeg" onChange={(e)=>{
                  preview(e.target.files);
                  if(mapSetting.img !== null){
                    del_img(mapSetting.img, config);
                  }
                }}></input>
                <div className="upload_img">
                  {upload_img === '' ? <img src="img/basic/notice/notice_base.jpg"></img> : <img src={upload_img} alt="이미지 경로를 확인해주세요"></img>}
                </div>

                {
                  upload_img === '' ? null : <div className="btn-minus" onClick={()=>{
                    if(mapSetting.img !== null){
                      del_img(mapSetting.img, config);
                    }
                    setUpload('');
                  }}>
                    <span><FontAwesomeIcon icon={faTrashCan}/></span>
                  </div>
                }
              </label>
                
              <div className="ex_con">
                <div className="ex_rows">
                  <p className="card-content-tit">결과예시</p>
                  <img src="img/basic/notice/bgEx2.jpg"></img>
                </div>
              </div>
            </div>
            
          </div>
        </section>  

        {/* 배경색 설정 (선택) */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>배경색 설정 (선택)</h3>
            </div>
            <p className="sub">해당페이지 배경색을 설정해주세요. / 미입력시 기본값으로 적용</p>
          
            <div className="background_con">
              <div className="opa_con">
                <div className="opacity_con">
                  {/* 배경색 */}
                  <div className="card-content">
                    <p className="card-content-tit">배경색</p>
                    <input type="color" name="bgcolor" className="clr_input" defaultValue={mapSetting.row.bgcolor}></input>
                  </div>

                   {/* 투명도 */}
                  <div className="card-content">
                    <p className="card-content-tit">투명도 <span id="menu_back_transparent">{mapSetting.row.transparent}%</span></p>
                    <div className="range_con">
                    <input type="range" name="transparent" className="opacity_input" min={0} max={100} defaultValue={mapSetting.row.transparent} onChange={(e)=>{
                      let val = e.target.value;
                      $("#menu_back_transparent").text(val+"%")
                    }}></input>
                 </div>
                  </div>
                </div>

                <div className="ex_con">
                  <div className="ex_rows">
                    <p className="card-content-tit">결과예시</p>
                    <img src="img/basic/notice/bgEx1.jpg"></img>
                  </div>
                </div>
              </div>
            </div>
          
          </div>
        </section>  


        {/* 위치정보 설정 */}
        <section className="grid">
          <div className="card">

            <div className="title-checkCon">
              <h3>위치정보 설정</h3>
            </div>

            <p className="sub">해당페이지 내 위치정보를 설정해주세요</p>

            <div className="main_con">
              <ul className="lists">
                <li>
                  <div className="img_con">
                    <img src="img/basic/map/map_address.png"></img>
                  </div>
                  <div className="desc_con">
                    <div className="title_con">
                      <h4>주소 및 연락처<span className="esenstial">*</span></h4>
                    </div>
                    <input type="text" name="addr" placeholder="주소를 입력해주세요" defaultValue={mapSetting.row.addr}></input>
                    <input type="text" name="tel" placeholder="대표번호를 입력해주세요" defaultValue={mapSetting.row.tel}></input>
                  </div>
                </li>
                <li>
                  <div className="img_con">
                    <img src="img/basic/map/map_subway.png"></img>
                  </div>
                  <div className="desc_con">
                    <div className="title_con">
                      <h4>지하철 이용시</h4>
                      <div className="check_con">
                        <label>
                          <input className="input_check_hidden" name="subway_show" type="hidden" value='N'></input>
                          <input className="check_menu input_check" name="subway_show" type="checkbox" value='Y' defaultChecked={mapSetting.row.subway_show === "Y" ? true : false}></input>
                          <div className="check_btn">
                            <span className="disabled">숨김</span>
                            <span className="abled">보임</span>
                            <div className="circle"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <textarea name="subway" className="subus" placeholder="주변 지하철 정보를 입력해주세요" defaultValue={mapSetting.row.subway}></textarea>
                  </div>
                </li>
                <li>
                  <div className="img_con">
                    <img src="img/basic/map/map_bus.png"></img>
                  </div>
                  <div className="desc_con">
                    <div className="title_con">
                      <h4>버스 이용시</h4>
                      <div className="check_con">
                        <label>
                          <input className="input_check_hidden" name="bus_show" type="hidden" value='N'></input>
                          <input className="check_menu input_check" name="bus_show" type="checkbox" value='Y' defaultChecked={mapSetting.row.bus_show === "Y" ? true : false}></input>
                          <div className="check_btn">
                            <span className="disabled">숨김</span>
                            <span className="abled">보임</span>
                            <div className="circle"></div>
                          </div>
                        </label>
                      </div>
                    </div>
                    <textarea name="bus" className="subus" placeholder="주변 버스 정보를 입력해주세요" defaultValue={mapSetting.row.bus}></textarea>
                  </div>
                </li>
              </ul>
              <div className="conts">
                <div className="title_con">
                  <h5>이미지 캡쳐본 업로드</h5>
                </div>
                <p className="sub">위치 이미지를 업로드해주세요</p>
                <div className="input_con img_input bg-map-con">
                  <label>
                  <input type="file" name="file2" accept="image/png, image/jpeg" onChange={(e)=>{preview(e.target.files, 2);}}></input>
                    <div className="upload_img">
                      {upload_img2 === '' ? <img src="img/basic/map/map_base.jpg"></img> : <img src={upload_img2} alt="이미지 경로를 확인해주세요"></img>}
                    </div>
                  </label>
                  {
                  upload_img2 === '' ? null : <div className="btn-minus" onClick={()=>{
                    setUpload2('');
                    //$("input[name='file2']").val('');
                  }}>
                    <span><FontAwesomeIcon icon={faTrashCan}/></span>
                  </div>
                }
                </div>
                <div className="map_link_con">
                  <img src="img/basic/map/map_link.png"></img>
                  <input type="text" name="google" placeholder="해당 매장 포털 사이트 지도 링크를 입력하세요" defaultValue={mapSetting.row.google}></input>
                </div>
              </div>
            </div>
          </div>
          
        </section>
      </form>
    )
  }
}

export default Set_map