import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_page, change_set, minus_list, plus_list } from "../store";
import {Set_header, Set_main, Set_notice, Set_around, Set_property, Set_charge, Set_review, Set_vod, Set_map} from './setting_page/setting_page';
// import './setting_page/set.css';
import './setting_page/set2.css';
import axios from "axios";
import Set_NaverVerification from "./setting_page/Set_NaverVerification";

function Basic(props){


  let store = useSelector((state)=>{return state.current_set});
  let select = store;
  let [menuSetting, setMenuSetting] = useState();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  let dispatch = useDispatch();
  useEffect(()=>{
    dispatch(change_page('basic'));
  }, [menuSetting]);

  useMemo(()=>{
    
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Basic/data', config).then((result)=>{setMenuSetting(result.data.RECORD)}).catch(()=>{alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.')});
  }, []);
  console.log("menuSetting");
  console.log(menuSetting);

  if(menuSetting){
    return(
      <div className="page-container">
        <div className="page-head">
          <div>
            <h2>홈페이지 설정</h2>
            <p className="sub">
              홈페이지 구성과 노출 상태를 관리합니다.
            </p>
          </div>
          
        </div>

        {/* 홈페이지 설정 탭 */}
        <ul className="grid hompage-set-tabs">
          <li onClick={()=>{
            dispatch(change_set(0))
          }} className={select === 0 ? "on" : null}>
            <h5>기본</h5>
          </li>
          <li onClick={()=>{
            dispatch(change_set(1))
          }} className={select === 1 ? "on" : null}>
            <h5>메인페이지</h5>
          </li>
          <li onClick={()=>{
            dispatch(change_set(4))
          }} className={select === 4 ? "on" : null}>
            <h5>매물보기</h5>
            <div className="status">
              {
                menuSetting.property_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>
          <li onClick={()=>{
            dispatch(change_set(2))
          }} className={select === 2 ? "on" : null}>
            <h5>공지&이벤트</h5>
            <div className="status">
              {
                menuSetting.notice_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>
          <li onClick={()=>{
            dispatch(change_set(3))
          }} className={select === 3 ? "on" : null}>
            <h5>둘러보기</h5>
            <div className="status">
              {
                menuSetting.around_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>
          
          {/* <li onClick={()=>{
            dispatch(change_set(5))
          }} className={select === 5 ? "on" : null}>
            <h5>이용요금</h5>
            <div className="status">
              {
                menuSetting.charge_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li> */}
          <li onClick={()=>{
            dispatch(change_set(6))
          }} className={select === 6 ? "on" : null}>
            <h5>이용후기</h5>
            <div className="status">
              {
                menuSetting.review_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>

          {/* 홍보영상 
          <li onClick={()=>{
            dispatch(change_set(7))
          }} className={select === 7 ? "on" : null}>
            <h5>홍보영상</h5>
            <div className="status">
              {
                menuSetting.vod_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>
          */}
          
          <li onClick={()=>{
            dispatch(change_set(8))
          }} className={select === 8 ? "on" : null}>
            <h5>오시는길</h5>
            <div className="status">
              {
                menuSetting.map_show === "Y" ? <span className="on">적용중</span> : <span className="off">숨김중</span>
              }
            </div>
          </li>
          <li onClick={()=>{
            dispatch(change_set(9))
          }} className={select === 9 ? "on" : null}>
            <h5>검색엔진 등록</h5>
            <div className="status">
              {
                menuSetting.naver_reserve_show=== "Y" ? <span className="on">등록됨</span> : <span className="off">미등록</span>
              }
            </div>
          </li>
        </ul>
        
        <div className="content_card">
          {
            {
              0 : <Set_header></Set_header>,
              1 : <Set_main></Set_main>,
              2 : <Set_notice></Set_notice>,
              3 : <Set_around></Set_around>,
              4 : <Set_property></Set_property>,
              // 5 : <Set_charge></Set_charge>,
              6 : <Set_review></Set_review>,
              7 : <Set_vod></Set_vod>,
              8 : <Set_map></Set_map>,
              9 : <Set_NaverVerification></Set_NaverVerification>,
            }[select]
          }
        </div>
      </div>
    )
  }
}



export default Basic