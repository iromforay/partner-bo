import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { change_page } from '../../store';
import { Link } from 'react-router-dom';
import { now_view } from '../../store';
import axios from "axios";
import $ from "jquery";

function chunk(params = [], size = 1) {
  const arr = [];
    
  for (let i = 0; i < params.length; i += size) {
    arr.push(params.slice(i, i + size));
  }

  return arr;
}

function Brd_all(props){
  
  //let [data, setData] = useState(props.data);
  let data = props.data;
  let origin = props.origin_data;
  let [now_data, setNow_data] = useState();
  let [now_page, setNow_page] = useState(1);
  let [page_info, setPage_info] = useState();

  console.log(data);
  console.log(origin);

  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }


  let page = [];
  for(let i = 0; i < origin.pager.total_page; i++){
    page.push('');
  }
  

  useEffect(()=>{
    setNow_data(data);
    setNow_page(1);
  }, [data]);

  useEffect(()=>{
    axios.get(process.env.REACT_APP_API_KEY+'Admin/Board/list?limit=8&page='+(now_page)+'&code='+(props.whats)+'', config).then((result)=>{console.log(result.data.RECORD.rows); setNow_data(result.data.RECORD.rows); setPage_info(result.data.RECORD.pager)});
  }, [now_page]);

  console.log(now_data, page, page_info)

  if(now_data){
    return(
      <div className="brd all_brd">
        <div className="fn_bar">
          <div className="search_con">
            <select>
              <option value='title'>글제목</option>
              <option value='content'>글내용</option>
              <option value='writer'>작성자</option>
            </select>
            <input type="text" name="search_txt" placeholder="검색어입력"></input>
            <div className="btn_search">
              <span>검색</span>
            </div>
          </div>
          <div className="btn_new">
            <span><Link to="/write">새 글쓰기</Link></span>
          </div>
        </div>
        <div className="borad_rows">
          <div className="rows row0">
            <ul>
              <li className="board_no">글번호</li>
              <li className="board_type">분류</li>
              <li className="score">별점</li>
              <li className="board_title">글제목</li>
              <li className="board_writer">작성자</li>
              <li className="board_date">작성일</li>
              <li className="board_hit">조회수</li>
              <li className="board_etc">비고</li>
            </ul>
          </div>
          {
            // {
            //   1 : page[0].map(function(a, i){
            //     return(
            //       <Rows data={page[0]} val={i} key={i}></Rows>
            //     )
            //   })
            // }[now_page]
            now_data ? now_data.map(function(a, i){
              return(
                <Rows cfg={config} data={now_data} page_data={page_info} val={i} key={i}></Rows>
              )
            }) : null
          }
        </div>
        <ul className='pagenation'>
          {page.map(function(a, i){
            return(
              <li className={now_page === i+1 ? 'on' : null} key={i} onClick={()=>{
                setNow_page(i+1);
                
              }}>
                <span>{i + 1}</span>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

function Rows(props){

  let dispatch = useDispatch();
  let datas = props.data;
  let page_datas = props.page_data;
  let types = '';
  switch(datas[props.val].board_type){
    case 'notice' : types = '공지' 
    break;
    case 'event' : types = '이벤트' 
    break;
    case 'charge' : types = '이용요금' 
    break;
    case 'review' : types = '이용후기' 
    break;
    case 'vod' : types = '홍보영상' 
    break;
  }

  function star_score(score){
    let a = ``;
    for(let i = 0; i < score; i++){
      a += `<img src='img/board/write/star.png'></img>`;
    }
    return a;
  }

  console.log(page_datas);

  return(
    <div className={"rows row"+(props.val+1)}>
      <ul className={datas[props.val].board_status === "N" ? "deleted" : null}>
        <li className="board_no">{datas[props.val].board_no}</li>
        <li className="board_type"><span className={datas[props.val].board_type}>{types}</span></li>
        <li className="score" dangerouslySetInnerHTML={{ __html : star_score(datas[props.val].score)  }}>{}</li>
        <li className="board_title" onClick={()=>{dispatch(now_view(datas[props.val]))}}><Link to='/view'>{datas[props.val].board_title}</Link></li>
        <li className="board_writer">{datas[props.val].board_writer}</li>
        <li className="board_date">{datas[props.val].board_date}</li>
        <li className="board_hit">{datas[props.val].board_hit}</li>
        <li className="board_etc">
          <div className="btns btn_edit">
            <span onClick={()=>{dispatch(now_view(datas[props.val]))}}><Link to='/edit'>글수정</Link></span>
          </div>
          <div className="btns btn_del">
            <span onClick={(()=>{
              let formData = new FormData();
              formData.append('board_no', datas[props.val].board_no);
              if(window.confirm('삭제하시겠습니까?')){
                axios.post(process.env.REACT_APP_API_KEY+'Admin/Board/board_del', formData, props.cfg).catch(()=>{
                  alert("데이터 전송이 실패하였습니다.");
                }).then((result)=>{
                  console.log(result);
                  alert('삭제되었습니다');
                  dispatch(change_page('board'));
                });
              }
            })}>글삭제</span>
          </div>
        </li>
      </ul>
    </div>
  )
}

export default Brd_all;