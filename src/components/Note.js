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
                  <span className="whole">
                    {data.counts?.all?.total_count || 0}
                  </span>
                </div>
              </div>
            </li>
            
            <li onClick={()=>{
              setSelect('consulting');

              axios.get(
                process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&status=consulting',
                config
              ).then((result)=>{
                setData(result.data.RECORD)
              });

            }} className={select === 'consulting' ? "on" : null}>
              <h5>상담중</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  <span className="whole">
                    {data.counts?.consulting?.total_count || 0}
                  </span>
                </div>
              </div>
            </li>

            <li onClick={()=>{
              setSelect('proposed');

              axios.get(
                process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&status=proposed',
                config
              ).then((result)=>{
                setData(result.data.RECORD)
              });

            }} className={select === 'proposed' ? "on" : null}>
              <h5>매물제안</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  <span className="whole">
                    {data.counts?.proposed?.total_count || 0}
                  </span>
                </div>
              </div>
            </li>

            <li onClick={()=>{
              setSelect('contracted');

              axios.get(
                process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&status=contracted',
                config
              ).then((result)=>{
                setData(result.data.RECORD)
              });

            }} className={select === 'contracted' ? "on" : null}>
              <h5>계약완료</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  <span className="whole">
                    {data.counts?.contracted?.total_count || 0}
                  </span>
                </div>
              </div>
            </li>

            <li onClick={()=>{
              setSelect('lost');

              axios.get(
                process.env.REACT_APP_API_KEY+'Admin/Note/list?limit=8&status=lost',
                config
              ).then((result)=>{
                setData(result.data.RECORD)
              });

            }} className={select === 'lost' ? "on" : null}>
              <h5>이탈</h5>
              <div className="status">
                <p>글 총갯수</p>
                <div className="counting">
                  <span className="whole">
                    {data.counts?.lost?.total_count || 0}
                  </span>
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