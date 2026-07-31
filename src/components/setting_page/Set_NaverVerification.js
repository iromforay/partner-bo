import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_set } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import $ from "jquery";
import post_ajax from "../../ajaxs";
import del_img from './del_fn';

function Set_NaverVerification(){
  let [dataSetting, setDataSetting] = useState(null);
  const [code, setCode] = useState("");
  const isRegistered = dataSetting?.naver_reserve_show === "Y";
  const looksLikeTag =
    code.includes("<meta") ||
    code.includes("content=");
  
  const [saved,setSaved] = useState(false);

  let dispatch = useDispatch();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');

  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  useEffect(() => {
    setCode(dataSetting?.naver_site_verification ?? "");
  }, [dataSetting]);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_KEY + "Admin/Basic/data", config)
      .then((result) => {
        setDataSetting(result.data.RECORD);
      })
      .catch(() => {
        alert("서버와의 연결이 끊겼습니다.");
        window.location.href = "/";
      });
  }, []);

  console.log(dataSetting);

  if(dataSetting){
    return(
      <form id="naverVerificationSetting" data-whats="naverVerification">
        <div className="row row1"></div>

        <div className="naver-page">

          <div className="page-head">
            <h1>네이버 검색 노출</h1>

            <p>
              네이버 서치어드바이저에 사이트를 등록하면, 
              우리 홈페이지가 네이버 검색결과에 노출됩니다. 아래 절차대로 소유확인 코드를 발급받아 입력해주세요.
            </p>

            <div className="status-row">
              <span className={isRegistered ? "pill on" : "pill off"}>
                <span className="dot" />
                {isRegistered ? " 등록됨" : " 미등록"}
              </span>

              <span className="status-meta">
                {isRegistered
                  ? "소유확인 코드가 입력되었습니다"
                  : "아직 소유확인 코드가 입력되지 않았습니다"}
              </span>
            </div>
          </div>

          <div className="grid">

            {/* 등록 절차 */}
            <div className="card guide">

              <h2>등록 절차</h2>
              <p className="sub">네이버 서치어드바이저 화면에서 아래 순서대로 진행하세요</p>

              <ol className="steps">
                <li>
                  <span className="step-num">1</span>
                  <span className="step-body">
                    <a href="https://searchadvisor.naver.com" target="_blank">
                      네이버 서치어드바이저
                    </a>
                    에 접속해 네이버 아이디로 로그인합니다.
                  </span>
                </li>

                <li>
                  <span className="step-num">2</span>
                  <span className="step-body">
                    <strong>웹마스터 도구 → 사이트 등록</strong>
                    에서 우리 홈페이지 주소를 입력합니다.
                    <div className="tag-callout">
                      https://foray.bomul.co.kr
                    </div>
                  </span>
                </li>

                <li>
                  <span className="step-num">3</span>
                  <span className="step-body">
                    소유확인 방법 중 <strong>HTML 태그</strong> 방식을 선택합니다. (파일 업로드 방식 아님)
                  </span>
                </li>

                <li>
                  <span className="step-num">4</span>
                  <span className="step-body">
                    화면에 나오는 태그에서 
                    <strong>content 값만</strong> 복사합니다.
                    <div className="tag-callout">
                      &lt;meta name="naver-site-verification"<br/>
                      content="<span className="hl">7848e6654dbff...</span>" /&gt;
                    </div>
                  </span>
                </li>

                <li>
                  <span className="step-num">5</span>
                  <span className="step-body">
                    오른쪽 입력창에 붙여넣고 <strong>저장</strong>누릅니다.
                  </span>
                </li>

                <li>
                  <span className="step-num">6</span>
                  <span className="step-body">
                    다시 서치어드바이저로 돌아가 <strong>확인</strong> 버튼을 클릭하면 등록이 완료됩니다.
                  </span>
                </li>
              </ol>
            </div>

            {/* 입력 */}
            <div className="card form-card">
              <h2>소유확인 코드</h2>
              <p className="sub">meta 태그의 <code>content="…"</code> 값만 입력하세요.</p>
                
              <label>네이버 사이트 소유확인 코드</label>
              <input
                type="hidden"
                name="naver_reserve"
                value={dataSetting?.naver_reserve ?? ""}
              />

              <input
                type="hidden"
                name="naver_reserve_show"
                value={code.trim() ? "Y" : "N"}
              />

              <input
                type="text"
                name="naver_site_verification"
                value={code}
                placeholder="예: 7848e6654dbff7b0a931f47a50e402d7d681bc06"
                onChange={(e)=>setCode(e.target.value)}
              />

              {
                looksLikeTag &&
                <p className="field-error show">태그 전체가 아니라 content 안의 값만 입력해주세요.</p>
              }

              <p className="field-help">&lt;meta&gt; 태그 전체를 붙여넣지 마시고, 값만 입력하세요.</p>

              <div className="actions">

                <div className="btns primary" onClick={()=>{
                    const this_form = $("form").attr("id");
                    let whats = $("form").attr("data-whats");
                    if(window.confirm('저장하시겠습니까?')){
                      post_ajax(this_form, whats, config);
                      setSaved(true);
                      dispatch(change_set(0));
                    }
                  }}>
                  <span>저장하기</span>
                </div>

                <div className="btns ghost" onClick={()=>{
                  if(window.confirm('검색엔진 등록 설정을 초기화 시키시겠습니까?\n초기화 후 저장하여 홈페이지에 적용하시기 바랍니다.')){
                      setCode("");//인풋 초기화
                    }
                  }}>
                  <span>초기화</span>
                </div>

                {saved &&
                  <span className="save-msg show">저장되었습니다</span>
                }
              </div>

              <div className="divider"/>

              <div className="preview">현재 홈페이지 head 반영 태그</div>

              <div className="tag-callout">
                {
                  code && !looksLikeTag
                  ?
                  <>
                    &lt;meta name="naver-site-verification"<br/>
                    content="<span className="hl">{code}</span>" /&gt;
                  </>
                  :
                  "아직 입력된 코드가 없습니다"
                }
              </div>
            </div>
          </div>
          
        </div>
      </form>
    )
  }
}

export default Set_NaverVerification;