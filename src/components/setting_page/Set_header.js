import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_set, minus_list, plus_del, plus_list, replace_list } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTrashCan} from "@fortawesome/free-regular-svg-icons";
import {faPlus} from "@fortawesome/free-solid-svg-icons";
import $ from "jquery";
import post_ajax from "../../ajaxs";
import axios from "axios";

function Set_header(props){

  let [basicSetting, setBasicSetting] = useState();
  let dispatch = useDispatch();
  let store = useSelector((state)=>{return state});
  let sns_cnt = store.snslist_cnt;
  let sns_del = store.sns_del;
  console.log(sns_cnt, sns_del)
  let [upload_logo_img, setUpload] = useState('');
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  useEffect(()=>{
    if(basicSetting){
      setUpload(basicSetting.logo_url);
      dispatch(replace_list(basicSetting.sns_link));
      $(".opa span").text(basicSetting.menu_back_transparent+"%")
      // $(".tit_menu").css({'color' : basicSetting.main_menu_color});
      // $(".tit_menu").css({'background' : '#EBEFF2'});
      // $(".tit_menu.point").css({'background' : basicSetting.sub_menu_color});
      // $(".tit_menu.point").css({'color' : '#fff'});
    }
  }, [basicSetting]);
  
  useMemo(()=>{
    
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Basic/data', config).then((result)=>{console.log(result); setBasicSetting(result.data.RECORD)}).catch(()=>{alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.'); window.location.href = '/';});
  }, []);

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

  console.log(basicSetting);
  if(basicSetting){
    return(
      <form id="headerSetting" data-whats="header">
        <div className="row row1">
          <div className="title_con">
            <h4>기본 설정</h4>
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
        <div className="row row2 common">
          <div className="set_con logo_set">
            <div className="title_con">
              <h5>홈페이지명, 로고설정</h5>
              <span>*필수</span>
            </div>
            <p>홈페이지 이름을 설정해주세요!<br></br>*로고 이미지가 없거나 숨김일 때 로고로 사용됩니다</p>
            <input type="text" name="site_name" className="input_title" placeholder="홈페이지 이름" defaultValue={basicSetting.site_name}></input>
            <p>기본 로고를 설정해주세요! / 가로160px, 세로 50px</p>
            <div className="input_con">
              <label>
                <input type="file" name="logo" accept="image/png, image/jpeg" onChange={(e)=>{preview(e.target.files)}}></input>
                <div className="upload_img">
                  {upload_logo_img === '' ? <img src="img/basic/logo_base.jpg"></img> : <img src={upload_logo_img} alt="이미지 경로를 확인해주세요"></img>}
                </div>
              </label>
              <div className="check_con">
                <label>
                  <input className="input_check_hidden" name="logo_show" type="hidden" value='N'></input>
                  <input className="check_menu input_check" name="logo_show" type="checkbox" value='Y' defaultChecked={basicSetting.logo_show === "Y" ? true : false}></input>
                  <div className="check_btn">
                    <span className="disabled">숨김</span>
                    <span className="abled">보임</span>
                    <div className="circle"></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <div className="set_con menu_set">
            <div className="menu_set_row1">
              <div className="title_con">
                <h5>메뉴&페이지 설정</h5>
                <span>*필수</span>
              </div>
              <p>메뉴 및 페이지 숨김/보임 설정</p>
              <ul>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu point">공지&이벤트</h5>
                    <label>
                      <input className="input_check_hidden" name="notice_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="notice_show" type="checkbox" value='Y' defaultChecked={basicSetting.notice_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu">둘러보기</h5>
                    <label>
                      <input className="input_check_hidden" name="around_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="around_show" type="checkbox"value='Y' defaultChecked={basicSetting.around_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu">이용요금</h5>
                    <label>
                      <input className="input_check_hidden" name="charge_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="charge_show" type="checkbox" value='Y' defaultChecked={basicSetting.charge_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu">이용후기</h5>
                    <label>
                      <input className="input_check_hidden" name="review_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="review_show" type="checkbox" value='Y' defaultChecked={basicSetting.review_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu">홍보영상</h5>
                    <label>
                      <input className="input_check_hidden" name="vod_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="vod_show" type="checkbox" value='Y' defaultChecked={basicSetting.vod_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
                <li>
                  <div className="check_con">
                    <h5 className="tit_menu">오시는길</h5>
                    <label>
                      <input className="input_check_hidden" name="map_show" type="hidden" value='N'></input>
                      <input className="check_menu input_check" name="map_show" type="checkbox" value='Y' defaultChecked={basicSetting.map_show === "Y" ? true : false}></input>
                      <div className="check_btn">
                        <span className="disabled">숨김</span>
                        <span className="abled">보임</span>
                        <div className="circle"></div>
                      </div>
                    </label>
                  </div>
                </li>
              </ul>
            </div>
            <div className="menu_set_row2">
              <div className="title_con">
                <h5>메뉴 배경색 설정</h5>
              </div>
              <p>메뉴의 배경색을 설정해주세요(색상 및 투명도를 설정할 수 있습니다.)</p>
              <div className="background_con">
              <div className="opa_con">
                <div className="opacity_con">
                  <input type="color" name="menu_back_color" className="clr_input" defaultValue={basicSetting.menu_back_color}></input>
                  <div className="range_con">
                    <input type="range" name="menu_back_transparent" className="opacity_input" min={0} max={100} defaultValue={basicSetting.menu_back_transparent} onChange={(e)=>{
                      let val = e.target.value;
                      $(".opa span").text(val+"%")
                    }}></input>
                    <p className="opa"><span>%</span>배경색 투명도</p>
                  </div>
                </div>
                <div className="ex_con">
                  <div className="ex_rows">
                    <p className="row_desc">결과예시 ①) 배경색 설정할 때</p>
                    <img src="img/basic/header_ex1.jpg"></img>
                  </div>
                  <div className="ex_rows">
                    <p className="row_desc">결과예시 ②) 배경색 투명도 값 설정할 때</p>
                    <img src="img/basic/header_ex2.jpg"></img>
                  </div>
                </div>
              </div>
              </div>
            </div>
            <div className="menu_set_row3">
              <div className="title_con">
                <h5>메뉴 글자색 설정</h5>
              </div>
              <div className="color_con">
                <div className="b_clr clr">
                  <p className="row_desc">전체 메뉴 글자색을 설정합니다.</p>
                  <div className="flx_box">
                    <input type="color" name="main_menu_color" defaultValue={basicSetting.main_menu_color} onChange={(e)=>{
                    // let clr = e.target.value;
                    // $(".tit_menu").css({'color' : clr});
                    // $(".tit_menu").css({'background' : '#EBEFF2'});
                    // console.log(clr)
                  }}></input>
                    <div>
                      <p>결과 예시)</p>
                      <img src="img/basic/header_ex3.jpg"></img>
                    </div>
                  </div>
                </div>
                <div className="p_clr clr">
                  <p className="row_desc">서브페이지 메뉴 선택 색상 설정</p>
                  <div className="flx_box">
                    <input type="color" name="sub_menu_color" defaultValue={basicSetting.sub_menu_color} onChange={(e)=>{
                    // let pt = e.target.value;
                    // $(".tit_menu.point").css({'background' : pt});
                    // $(".tit_menu.point").css({'color' : '#fff'});
                  }}></input>
                    <div>
                      <p>결과 예시)</p>
                      <img src="img/basic/header_ex4.jpg"></img>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row row3 links">
          <div className="title_con">
            <h5>타 사이트 링크 메뉴 설정</h5>
            <div className="check_con">
              <label>
                <input className="input_check_hidden" name="link_menu_show" type="hidden" value='N'></input>
                <input className="check_menu input_check" name="link_menu_show" type="checkbox" value='Y' defaultChecked={basicSetting.link_menu_show === "Y" ? true : false}></input>
                <div className="check_btn">
                  <span className="disabled">숨김</span>
                  <span className="abled">보임</span>
                  <div className="circle"></div>
                </div>
              </label>
            </div>
          </div>
          <div className="btn_con">
            <p>유튜브, 인스타 등 개인 SNS링크를 설정합니다. (5개까지 설정 가능)</p>
            <div className="plus" onClick={()=>{
              let fake = {
                key : '',
                link : '',
                img_url : 'img/basic/sns_base.jpg'
              }
              if(sns_cnt.length < 5){
                dispatch(plus_list(fake))
              }else{alert("타 사이트 링크는 5개까지만 설정 가능합니다.")}
            }}>
              <FontAwesomeIcon icon={faPlus} />
              <span>링크 추가</span>
            </div>
          </div>
          <ul>
            {
              sns_cnt.map(function(a, i){
                return(
                  <Snslist key={i} val={i} data={sns_cnt}></Snslist>
                )
              })
            }
          </ul>
          {
            sns_del.map(function(a, i){
              return(
                <input type="hidden" name="sns_del_key[]" defaultValue={sns_del[i]} key={i}></input>
              )
            })
          }
        </div>
        <div className="row row4 links">
          <div className="title_con">
            <h5>하단 고정메뉴 설정</h5>
          </div>
          <div className="reserve_con">
            <div className="naver_con">
              <div className="title_con">
                <p>네이버 예약</p>
                <div className="check_con">
                  <label>
                    <input className="input_check_hidden" name="naver_reserve_show" type="hidden" value='N'></input>
                    <input className="check_menu input_check" name="naver_reserve_show" type="checkbox" value='Y' defaultChecked={basicSetting.naver_reserve_show === "Y" ? true : false}></input>
                    <div className="check_btn">
                      <span className="disabled">숨김</span>
                      <span className="abled">보임</span>
                      <div className="circle"></div>
                    </div>
                  </label>
                </div>
              </div>
              <input type="text" name="naver_reserve" placeholder="네이버 예약 링크주소" defaultValue={basicSetting.naver_reserve}></input>
            </div>
            <div className="kakao_con">
            <div className="title_con">
              <p>카카오톡 채널</p>
              <div className="check_con">
                <label>
                  <input className="input_check_hidden" name="kakao_channel_show" type="hidden" value='N'></input>
                  <input className="check_menu input_check" name="kakao_channel_show" type="checkbox" value='Y' defaultChecked={basicSetting.kakao_channel_show === "Y" ? true : false}></input>
                  <div className="check_btn">
                    <span className="disabled">숨김</span>
                    <span className="abled">보임</span>
                    <div className="circle"></div>
                  </div>
                </label>
              </div>
            </div>
            <input type="text" name="kakao_channel" placeholder="카카오 채널 링크주소" defaultValue={basicSetting.kakao_channel}></input>
          </div>
          </div>
        </div>
        <div className="row row5">
          <div className="title_con">
            <h5>푸터 설정</h5>
            <span>*필수</span>
          </div>
          <p>사이트 내 최하단 영역에 들어가는 매장 세부사항들을 입력해주세요</p>
          <div className="input_con">
            <input type="text" name="company_name" placeholder="회사상호명 입력" defaultValue={basicSetting.company_name}></input>
            <textarea name="footer_copy" placeholder="대표이사 : 나병연 | 개인정보관리책임자 : 나병연 | 사업자등록번호 : 000-00-00000 | 주소 경기 부천시 | TEL 02-1234-5678" defaultValue={basicSetting.footer_copy}></textarea>
          </div>
          <p className="copy">Copyrightⓒ 2023 all-teaching All rights reserved.</p>
        </div>
      </form>
    )
  }

  
}

function Snslist(props){

  //let [sns_link, setSns_link] = useState(props.data[props.val].link);
  let dispatch = useDispatch();

  let sns_key = props.data[props.val].key,
      sns_link = props.data[props.val].link,
      sns_img_url = props.data[props.val].img_url;

  function preview(input, idx){
    if (input.length !== 0) {
      var reader = new FileReader();
      reader.onload = function(e) {
        $(".upload_img"+idx+" img").attr('src', e.target.result);
      };
      reader.readAsDataURL(input[0]);
    } else {
      return;
    }
  }

  return(
    <li>
      <div className="input_con">
        <label>
          <input className="sns_img" type="file" name='sns_img[]' accept="image/png, image/jpeg" onChange={(e)=>{preview(e.target.files, props.val)}}></input>
          <div className={"upload_img upload_img"+props.val}>
            <img src={sns_img_url}></img>
          </div>
        </label>
        <input type="text" name='sns_link[]' className="sns_link" placeholder="SNS 링크주소 입력" defaultValue={sns_link} key={sns_link}></input>
        <input type="hidden" name="sns_key[]" defaultValue={sns_key}></input>
      </div>
      <div className="minus">
        <span onClick={()=>{dispatch(minus_list(props.val)); dispatch(plus_del(sns_key))}}><FontAwesomeIcon icon={faTrashCan} /></span>
      </div>
    </li>
  )
}

export default Set_header