import './App.css';
import { Routes, Route, Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { log_in_out, set_idkey } from './store';
import $ from 'jquery';
import axios from 'axios';
import Header from './components/Header';


function App() {
console.log("REACT_APP_API_KEY : " + process.env.REACT_APP_API_KEY);
  let alt = useSelector((state)=>{return state.alt_log});
  let dispatch = useDispatch();
  let id = window.localStorage.getItem('id');
  let login_key = window.localStorage.getItem('login_key');
  console.log(alt, id, login_key);

  const urlParams = new URL(window.location.href).searchParams;
  const session = urlParams.get('session');
  console.log(session);

  useEffect(()=>{
    if(id){
      //dispatch(set_idkey([id, login_key]));

    }
    if(id !== null && alt === false && session === null){
      dispatch(log_in_out());
    }
  }, []);

  useEffect(()=>{
    if(session){
      window.localStorage.removeItem('id');
      window.localStorage.removeItem('login_key');
      let formData = new FormData();
      formData.append('session_id', session);
      axios.post(process.env.REACT_APP_API_KEY+'Admin/User/sessionLogin', formData).then((result)=>{
        console.log(result);
        if(result.data.MSG.fid === ''){
          alert('매장정보없음');
        }else{
          dispatch(log_in_out());
          window.localStorage.setItem('login_key', result.data.MSG.session_id);
          window.localStorage.setItem('id', result.data.MSG.fid);
        }
      }).catch(()=>{
        
      });
    }
  }, [])

  function log_in(){
    if(alt === false){
      let testForm = document.getElementById('form_login');
      let formData = new FormData(testForm);
      axios.post(process.env.REACT_APP_API_KEY+'Admin/User/login', formData).then((result)=>{
        console.log(result);
        if(result.data.MSG.fid === ''){
          alert('매장정보없음');
        }else{
          dispatch(log_in_out());
          window.localStorage.setItem('login_key', result.data.MSG.session_id);
          window.localStorage.setItem('id', result.data.MSG.fid);
        }
      }).catch(()=>{
        alert("아이디와 비밀번호를 확인해주세요.");
      });
    }
  }

  return (
    <div className="App">
      {
        id === undefined || id === null ?
        <div className='login_con'>
          <div className='width_con'>
            <h3>ADMIN LOGIN</h3>
            <div className='loginput'>
              <form id='form_login' onKeyUp={(e)=>{if(e.key === 'Enter') log_in();}}>
                <div className='id_con'>
                  <input name='user_id' type='text' autoComplete='off' placeholder='아이디' ></input>
                </div>
                <div className='pw_con'>
                  <input name='password' type='password' autoComplete='off' placeholder='비밀번호'></input>
                </div>
                <div className='btn_con'>
                  <span onClick={()=>{
                    log_in();
                  }}>로그인</span>
                </div>
              </form>
            </div>
          </div>
        </div> : null
      }
      {
        alt === true && id !== null ? <Header></Header> : null
      }
    </div>
  );
}

export default App;
