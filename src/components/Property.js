import { useEffect, useMemo, useState } from "react"
import { useDispatch, useSelector } from "react-redux";
import { change_page, minus_list, plus_list } from "../store";
import Property_list from './property_page/Property_list';
import './board_page/brd.css';
import axios from "axios";


function Property(){

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
    dispatch(change_page('property'));
  }, [])

  const fetchProperty = () => {
    axios.get(
      process.env.REACT_APP_API_KEY+'Admin/Property/list?limit=8',
      config
    )
    .then((result)=>{
      console.log(result.data.RECORD);
      setData(result.data.RECORD);
    });
  };

  useEffect(()=>{
    fetchProperty();
  }, []);

  if(data){
    return(
      <div className="page-container container board-page-container">
        <div className="page-head">
          <h2>매물 관리</h2>
        </div>
        <div className="section board ">
          <div className="width_con ">

            <ul className="tabs">
              <li onClick={()=>{
                setSelect('all');
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
              <li onClick={()=>{setSelect('display_y');}}
                  className={select === 'display_y' ? "on" : null}>
                <h5>노출중</h5>
                <div className="status">
                  <p>글 총갯수</p>
                  <span className="whole">
                    {data.display_counts?.["1"]?.total_count || 0}
                  </span>
                </div>
              </li>
              <li onClick={()=>{setSelect('display_n');}}
                  className={select === 'display_n' ? "on" : null}>
                <h5>비노출</h5>
                <div className="status">
                  <p>글 총갯수</p>
                  <div className="counting">
                    <span className="whole">
                      {data.display_counts?.["2"]?.total_count || 0}
                    </span>
                  </div>
                </div>
              </li>
              <li onClick={()=>{setSelect('status_3');}}
                  className={select === 'status_3' ? "on" : null}>
                <h5>거래완료</h5>
                <div className="status">
                  <p>글 총갯수</p>
                  <div className="counting">
                    <span className="whole">
                      {data.counts?.["3"]?.total_count || 0}
                    </span>
                  </div>
                </div>
              </li>
            </ul>

            <div className="board_con ">
            
              <Property_list 
                origin_data={data} 
                data={copy_data} 
                whats={select}
                refreshParent={fetchProperty}
              >
              </Property_list>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Property;