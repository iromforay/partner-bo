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
      {/* ---- 검색 툴바 영역 ---- */}
      <div className="toolbar">
        <div className="toolbar-search">
          <div className="toolbar-register">
            <span><Link to="/write" className="btn btn-primary">게시글 등록</Link></span>
          </div>
        </div>

        {/* ---- 리스트 테이블 영역 ---- */}
      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>글번호</th>
              <th>분류</th>
              <th>별점</th>
              <th>글제목</th>
              <th>작성자</th>
              <th>작성일</th>
              <th>조회수</th>
              <th>관리</th>
            </tr>
          </thead>

          <tbody>
            {now_data && now_data.length > 0 ? (
              now_data.map((item, i) =>
                <Rows
                  key={item.board_no || i}
                  cfg={config}
                  data={item}
                  page_data={page_info}
                  // refreshData={fetchData}
                  refreshParent={props.refreshParent}
                />
              )
            ) : (
              <tr>
                <td colSpan="11">
                  조회된 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <ul className='pagenation board_pagenation'>
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

    </div>
    )
  }
}

function Rows(props){

  let dispatch = useDispatch();
  let data = props.data;
  let page_datas = props.page_data;
  let types = '';
  switch(data.board_type){
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
    <tr className={data.board_status === "N" ? "deleted" : null}>
      <td>{data.board_no}</td>
      <td className=""><span className={`tag ${data.board_type}`}>{types}</span></td>
      <td className="" dangerouslySetInnerHTML={{ __html : star_score(data.score)  }}>{}</td>
      <td className="col-title" onClick={()=>{dispatch(now_view(data))}}>
        <Link to='/view'>{data.board_title}</Link></td>
      <td className="">{data.board_writer}</td>
      <td className="col-date">{data.board_date}</td>
      <td className="">{data.board_hit}</td>
      <td>
        <div className="row-actions">
          <span className="btn btn-muted" onClick={()=>{dispatch(now_view(data))}}>
            <Link to='/edit'>수정</Link>
          </span>

          <div className="btn btn_del">
            <span onClick={(()=>{
              let formData = new FormData();
              formData.append('board_no', data.board_no);
              if(window.confirm('삭제하시겠습니까?')){
                axios.post(process.env.REACT_APP_API_KEY+'Admin/Board/board_del', formData, props.cfg).catch(()=>{
                  alert("데이터 전송이 실패하였습니다.");
                }).then((result)=>{
                  console.log(result);
                  alert('삭제되었습니다');
                  props.refreshParent();//글 총갯수 다시 조회
                  dispatch(change_page('board'));
                });
              }
            })}>삭제</span>
          </div>
        </div>
        
      </td>
    </tr>
  )
}

export default Brd_all;