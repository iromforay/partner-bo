import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
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
import { change_set } from "../../store";


function Set_notice(){
  let [noticeSetting, setNoticeSetting] = useState();
  let [contents, setContents] = useState("");
  let [upload_logo_img, setUpload] = useState('');
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }
  

  useMemo(()=>{
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Menu/data?code=notice', config).then((result)=>{setNoticeSetting(result.data.RECORD); console.log('아작스 통신', result)}).catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
    });
  }, []);

  useEffect(()=>{
    if(noticeSetting){
      setContents(noticeSetting.row.title);
      if(noticeSetting.img !== null){
        setUpload(noticeSetting.img[0].full_url);
      }
    }
  }, [noticeSetting])

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

  console.log(noticeSetting);

  if(noticeSetting){
    return(
      <form id="noticeSetting" data-whats="notice">
        <div className="row row1">
          <div className="btn_con">
            <div className="btns temporary" onClick={()=>{
              if(window.confirm('공지&이벤트 페이지 설정을 초기화 시키시겠습니까?\n초기화 후 저장하여 홈페이지에 적용하시기 바랍니다.')){
                $("input[name='bgcolor']").val('#f5f5f5');
                $("input[name='transparent']").val(0);
                $(".opa span").text(0+"%");
              }
            }}>
              <span>초기화</span>
            </div>
            <div className="btns apply" onClick={()=>{
                const this_form = $("form").attr("id");
                let whats = $("form").attr("data-whats");
                if(window.confirm('저장하시겠습니까?')){
                  post_ajax(this_form, whats, config, contents);
                  dispatch(change_set(0));
                }
              }}>
              <span>저장하기</span>
            </div>
          </div>
        </div>
        <div className="row row2">
          <div className="title_con">
            <h5>공지&이벤트 페이지 설정</h5>
          </div>
          
          <div className="set_con">
            <div>
              <div className="title_con">
                <h5>배경 설정 (선택)</h5>
              </div>
              <p className="opt">해당페이지 배경 이미지와 색을 설정해주세요 / 이미지, 배경색 순으로 나타납니다. / 미입력시 기본값으로 적용</p>
            </div>

            <div className="inner_con">
              <div className="input_con img_input form_group">
                <label>
                  <input type="file" name="file" onChange={(e)=>{
                    preview(e.target.files);
                    if(noticeSetting.img !== null){
                      del_img(noticeSetting.img, config);
                    }
                  }} accept="image/png, image/jpeg"></input>
                  <div className="upload_img">
                    {upload_logo_img === '' ? <img src="img/basic/notice/notice_base.jpg"></img> : <img src={upload_logo_img} alt="이미지 경로를 확인해주세요"></img>}
                  </div>

                  {
                    upload_logo_img === '' ? null : <div className="del_slide minus" onClick={()=>{
                      if(noticeSetting.img !== null){
                        del_img(noticeSetting.img, config);
                      }
                      setUpload('');
                    }}>
                      <span><FontAwesomeIcon icon={faTrashCan}/></span>
                    </div>
                  }
                </label>
                
                <div className="ex_con">
                  <p className="opt">결과예시)</p>
                  <img src="img/basic/notice/bgEx2.jpg"></img>
                </div>
              </div>
            </div>

            <div className="inner_con">
              <div className="opa_con">
                <div className="opacity_con">
                  <input type="color" name="bgcolor" className="clr_input" defaultValue={noticeSetting.row.bgcolor}></input>
                  <div className="range_con">
                    <input type="range" name="transparent" className="opacity_input" min={0} max={100} defaultValue={noticeSetting.row.transparent} onChange={(e)=>{
                      let val = e.target.value;
                      $(".opa span").text(val+"%")
                    }}></input>
                    <p className="opa"><span>{noticeSetting.row.transparent}%</span>배경색 투명도</p>
                  </div>
                </div>
                <div className="ex_con">
                  <p className="opt">결과예시)</p>
                  <img src="img/basic/notice/bgEx1.jpg"></img>
                </div>
              </div>
            </div>

          </div>
        </div>
        
      </form>
    )
  }
}

export default Set_notice