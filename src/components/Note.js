import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_page, minus_list, plus_list } from "../store";
import Note_list from './note_page/Note_list';
import './board_page/brd.css';
import axios from "axios";

function Note(){

  let [select, setSelect] = useState('all');
  let [data, setData] = useState();
  let [copy_data, setCopy] = useState();
  let dispatch = useDispatch();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  const config = {
    headers : {
      'Authorization': `Bearer ${login_key}`
    }
  }

  useEffect(()=>{
    if(data){
      setCopy(data.rows);
    }
  }, [data]);

  useEffect(()=>{
    dispatch(change_page('note'));
  }, [])

  useMemo(()=>{
    return axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
  }, [])

  console.log(data)
  console.log('렌더링!note');

  if(data){
    return(
      <div className="sections board">
        <div className="width_con">
          <h3>노트 관리</h3>
          <ul className="tabs">
            <li onClick={()=>{
              setSelect('all');
              axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
            }} className={select === 'all' ? "on" : null}>
              <h5>전체</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  <span className="whole">{data.pager?.total_items}</span>
                </div>
              </div>
            </li>
            <li onClick={()=>{
              setSelect('notice');
              // let copy = [...data.rows];
              // const filtering = ['notice', 'event'];
              // copy = copy.filter((a)=> a.board_type === 'notice' || a.board_type === 'event');
              // setCopy(copy);
              axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&code=notice', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
            }} className={select === 'notice' ? "on" : null}>
              <h5>상담중</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  {/* <span className="whole">{data.boards.notice.total_count}</span> */}
                </div>
              </div>
            </li>
            <li onClick={()=>{
              setSelect('charge');
              // let copy = [...data.rows];
              // copy = copy.filter((a)=> a.board_type === 'charge');
              // setCopy(copy);
              axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&code=charge', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
            }} className={select === 'charge' ? "on" : null}>
              <h5>매물제안</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  {/* <span className="whole">{data.boards.charge.total_count}</span> */}
                </div>
              </div>
            </li>
            <li onClick={()=>{
              setSelect('review');
              // let copy = [...data.rows];
              // copy = copy.filter((a)=> a.board_type === 'review');
              // setCopy(copy);
              axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&code=review', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
            }} className={select === 'review' ? "on" : null}>
              <h5>계약완료</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  {/* <span className="whole">{data.boards.review.total_count}</span> */}
                </div>
              </div>
            </li>
            <li onClick={()=>{
              setSelect('review');
              // let copy = [...data.rows];
              // copy = copy.filter((a)=> a.board_type === 'review');
              // setCopy(copy);
              axios.get(process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&code=review', config).then((result)=>{console.log(result.data.RECORD); setData(result.data.RECORD)});
            }} className={select === 'review' ? "on" : null}>
              <h5>이탈</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  {/* <span className="whole">{data.boards.review.total_count}</span> */}
                </div>
              </div>
            </li>
          </ul>
          <div className="board_con">
            <Note_list origin_data={data} data={copy_data} whats={select}></Note_list>
          </div>
        </div>
      </div>
    )
  }
}

export default Note;