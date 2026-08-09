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
      $("#menu_back_transparent").text(basicSetting.menu_back_transparent+"%")
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
        {/* 타이틀/버튼 */}
        <section className="grid">
          <div className="card homepage-set-title-btn">
            <h3>기본 설정</h3>
            <div className="btn-row">
              <div className="btn btn-muted" onClick={()=>{
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
              <div className="btn btn-primary" onClick={()=>{
                  const form = document.getElementById("headerSetting");
                  //esenstial 속성체크
                  if(!form.checkValidity()){
                    form.reportValidity();
                    return;
                  }
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
        </section>

        {/* 홈페이지명/로고 설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
                <h3>홈페이지명<span className="esenstial">*</span></h3>
            </div>
            <p className="sub">로고 이미지가 없거나 숨김일 때 로고로 사용됩니다.</p>
            <input type="text" name="site_name" className="input_title" placeholder="홈페이지 이름" defaultValue={basicSetting.site_name}
              style={{marginBottom:'20px'}}
            ></input>

            <div className="title-checkCon">
              <h3>로고 설정<span className="esenstial">*</span></h3>
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
            <p className="sub">가로160px, 세로 50px</p>
            <div className="input_con">
              <label>
                <input type="file" name="logo" accept="image/png, image/jpeg" onChange={(e)=>{preview(e.target.files)}}></input>
                <div className="upload_img upload_img_logo">
                  {upload_logo_img === '' ? <img src="img/basic/logo_base.jpg"></img> : <img src={upload_logo_img} alt="이미지 경로를 확인해주세요"></img>}
                </div>
              </label>
            </div>

          </div>
        </section>

        {/* 메뉴&페이지 설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>메뉴&페이지 설정<span className="esenstial">*</span></h3>
            </div>
            <p className="sub">메뉴 및 페이지 숨김/보임을 설정합니다.</p>

            <ul className="checkCon-row">
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
                  <h5 className="tit_menu">매물관리</h5>
                  <label>
                    <input className="input_check_hidden" name="property_show" type="hidden" value='N'></input>
                    <input className="check_menu input_check" name="property_show" type="checkbox"value='Y' defaultChecked={basicSetting.property_show === "Y" ? true : false}></input>
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
        </section>

        {/* 메뉴 배경색 설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>메뉴&페이지 설정<span className="esenstial">*</span></h3>
            </div>
            <p className="sub">색상 및 투명도를 설정할 수 있습니다.</p>

            <div className="background_con">
              <div className="opa_con">
                <div className="opacity_con">
                  {/* 배경색 */}
                  <div className="card-content">
                    <p className="card-content-tit">배경색</p>
                    <input type="color" name="menu_back_color" className="clr_input" defaultValue={basicSetting.menu_back_color}></input>
                  </div>

                  {/* 투명도 */}
                  <div className="card-content">
                    <p className="card-content-tit">투명도 <span id="menu_back_transparent">{basicSetting.menu_back_transparent}%</span></p>
                    
                    <input type="range" name="menu_back_transparent" className="opacity_input" min={0} max={100} defaultValue={basicSetting.menu_back_transparent} onChange={(e)=>{
                      let val = e.target.value;
                      $("#menu_back_transparent").text(val+"%")
                    }}></input>
                  </div>

                </div>

                {/* 결과예시 */}
                <div className="ex_con">
                  <div className="ex_rows">
                    <p className="card-content-tit">결과예시</p>
                    <p className="sub">①) 배경색 설정할 때</p>
                    <img src="img/basic/header_ex1.jpg"></img>
                    <p className="sub"> ②) 배경색 투명도 값 설정할 때</p>
                    <img src="img/basic/header_ex2.jpg"></img>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 메뉴 글자색 설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>메뉴 글자색 설정</h3>
            </div>
            <p className="sub">글자 색을 설정할 수 있습니다.</p>

              <div className="opa_con">
                <div className="opacity_con">
                  {/* 전체 메뉴 글자색 */}
                  <div className="card-content">
                    <p className="card-content-tit">전체 메뉴 글자색</p>
                    <input className="clr_input" type="color" name="main_menu_color" defaultValue={basicSetting.main_menu_color} onChange={(e)=>{}}></input>
                  </div>

                  {/* 서브페이지 메뉴 선택 색상 */}
                  <div className="card-content">
                    <p className="card-content-tit">서브 메뉴 선택시 색상</p>
                    <input className="clr_input" type="color" name="sub_menu_color" defaultValue={basicSetting.sub_menu_color} onChange={(e)=>{}}></input>
                  </div>
                </div>

                {/* 결과예시 */}
                <div className="ex_con">
                  <div className="ex_rows">
                    <p className="card-content-tit">결과예시</p>
                    <p className="sub">①) 전체메뉴 글자색 설정할 때</p>
                    <img src="img/basic/header_ex3.jpg"></img>

                    <p className="sub"> ②) 서브메뉴 선택 시 색상 설정할 때</p>
                    <img src="img/basic/header_ex4.jpg"></img>
                  </div>
                </div>

              </div>
            </div>
        </section>

        {/* 타 사이트 링크 메뉴 설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>타 사이트 링크 메뉴 설정</h3>
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
            <p className="sub">유튜브, 인스타 등 개인 SNS링크를 설정합니다. (5개까지 설정 가능)</p>

            <div className="btn_con" >
              <div className="btn btn-plus" onClick={()=>{
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

            <ul className="grid_row">
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
        </section>

        {/* 하단 고정메뉴 설정 */}
        <section className="grid fix-menu">
          <div className="card">
            <div className="title-checkCon">
              <h3>하단 고정메뉴 설정</h3>
            </div>
            <p className="sub"></p>

            <div className="grid_row">
              <div className="form_group">
                <div className="check_con">
                  <label>네이버 예약
                    <input className="input_check_hidden" name="naver_reserve_show" type="hidden" value='N'></input>
                    <input className="check_menu input_check" name="naver_reserve_show" name="naver_reserve_show" type="checkbox" value='Y' defaultChecked={basicSetting.naver_reserve_show === "Y" ? true : false}></input>
                    <div className="check_btn">
                      <span className="disabled">숨김</span>
                      <span className="abled">보임</span>
                      <div className="circle"></div>
                    </div>
                  </label>
                </div>

                <input type="text" name="naver_reserve" placeholder="네이버 예약 링크주소" defaultValue={basicSetting.naver_reserve}></input>
              </div>
            
              <div className="form_group">
                <div className="check_con">
                  <label>카카오톡 채널
                    <input className="input_check_hidden" name="kakao_channel_show" type="hidden" value='N'></input>
                    <input className="check_menu input_check" name="kakao_channel_show" type="checkbox" value='Y' defaultChecked={basicSetting.kakao_channel_show === "Y" ? true : false}></input>
                    <div className="check_btn">
                      <span className="disabled">숨김</span>
                      <span className="abled">보임</span>
                      <div className="circle"></div>
                    </div>
                  </label>
                </div>
                <input type="text" name="kakao_channel" placeholder="카카오 채널 링크주소" defaultValue={basicSetting.kakao_channel}></input>
              </div>
            </div>

          </div>

          
        </section>

        {/* 푸터설정 */}
        <section className="grid">
          <div className="card">
            <div className="title-checkCon">
              <h3>푸터설정<span className="esenstial">*</span></h3>
            </div>

            <p className="sub">사이트 내 최하단 영역에 들어가는 매장 세부사항들을 입력해주세요.</p>

            <div className="grid_row">
              <div className="form_group">
                <label htmlFor="broker_office_name">중개사무소 명칭</label>
                <input
                  type="text"
                  id="broker_office_name"
                  name="broker_office_name"
                  placeholder="중개사무소 명칭 입력"
                  esenstial
                  defaultValue={basicSetting.broker_office_name}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_address">중개사무소 소재지</label>
                <input
                  type="text"
                  id="broker_address"
                  name="broker_address"
                  placeholder="중개사무소 소재지 입력"
                  esenstial
                  defaultValue={basicSetting.broker_address}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_phone">중개사무소 연락처</label>
                <input
                  type="text"
                  id="broker_phone"
                  name="broker_phone"
                  placeholder="중개사무소 연락처 입력"
                  esenstial
                  defaultValue={basicSetting.broker_phone}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_reg_no">중개사무소 등록번호</label>
                <input
                  type="text"
                  id="broker_reg_no"
                  name="broker_reg_no"
                  placeholder="중개사무소 등록번호 입력"
                  esenstial
                  defaultValue={basicSetting.broker_reg_no}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_ceo_name">개업공인중개사 성명</label>
                <input
                  type="text"
                  id="broker_ceo_name"
                  name="broker_ceo_name"
                  placeholder="개업공인중개사 성명 입력"
                  esenstial
                  defaultValue={basicSetting.broker_ceo_name}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_agent_name">소속공인중개사 성명</label>
                <input
                  type="text"
                  id="broker_agent_name"
                  name="broker_agent_name"
                  placeholder="소속공인중개사 성명 입력(선택)"
                  defaultValue={basicSetting.broker_agent_name}
                />
              </div>

              <div className="form_group">
                <label htmlFor="broker_agent_phone">소속공인중개사 연락처</label>
                <input
                  type="text"
                  id="broker_agent_phone"
                  name="broker_agent_phone"
                  placeholder="소속공인중개사 연락처 입력(선택)"
                  defaultValue={basicSetting.broker_agent_phone}
                />
              </div>
            </div>


            <div className="preview">현재 홈페이지 푸터</div>
            <div className="tag-callout">
              {basicSetting.footer_copy
                ?
                <>
                  {basicSetting.footer_copy}
                </>
                :
                "아직 입력된 푸터가 없습니다"
              }
            </div>
          </div>
        </section>

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
    <li className="form_group form_group_link">
    <label>
      <input className="sns_img" type="file" name='sns_img[]' accept="image/png, image/jpeg" onChange={(e)=>{preview(e.target.files, props.val)}}></input>

      <div className={"upload_img upload_img_link upload_img"+props.val}>
        <img src={sns_img_url}></img>
      </div>
      <input type="text" name='sns_link[]' className="sns_link" placeholder="SNS 링크주소 입력" defaultValue={sns_link} key={sns_link}></input>
      <input type="hidden" name="sns_key[]" defaultValue={sns_key}></input>

      {/* 삭제버튼 */}
      <div className="btn-minus">
        <span onClick={()=>{dispatch(minus_list(props.val)); dispatch(plus_del(sns_key))}}><FontAwesomeIcon icon={faTrashCan} /></span>
      </div>
      </label>
    </li>
  )
}

export default Set_header