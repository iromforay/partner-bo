import axios from "axios";
import $ from "jquery";
import { useDispatch } from "react-redux";

function post_ajax(this_form, whats, config, contents){

  $("#"+this_form+" .input_check").each(function(){
    if($(this).is(':checked')){
      $(this).prev(".input_check_hidden").attr('disabled', true);
    }else{
      $("#"+this_form+" .input_check_hidden").attr('disabled', false);
    }
  });

  
  let txtln = whats.length;
  var testForm = document.getElementById(this_form);
  let formData = new FormData(testForm);
  let this_menu = this_form.substring(0, txtln);

  if(whats === 'header'){

    axios.post(process.env.REACT_APP_API_KEY+'Admin/Basic/save', formData, config)
    .then((result)=>{
      console.log(result);
      alert('저장되었습니다');
    }).catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
      window.location.href = '/';
    });
  
  } else if(whats === 'menu'){

    formData.append('code','property');

    axios.post(
      process.env.REACT_APP_API_KEY+'Admin/Menu/save',
      formData,
      config
    )
  } else if(whats === 'property'){

    axios.post(
      process.env.REACT_APP_API_KEY+'Admin/FunctionMenu/save_property',
      formData,
      config
    )
    .then((result)=>{
      alert('저장되었습니다');

    })
    .catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
      window.location.href='/';
    });
  } else if(whats === 'naverVerification'){

    axios.post(
      process.env.REACT_APP_API_KEY+'Admin/basic/Save_verification_code',
      formData,
      config
    )
    .then((result)=>{
      // console.log("저장 후 조회:", result.data.RECORD);
      alert('저장되었습니다');
    })
    .catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
      // window.location.href='/';
    });

  }else{

      if(contents){
        formData.append('title', contents);
      }

      formData.append('code', this_menu);

      axios.post(
        process.env.REACT_APP_API_KEY+'Admin/Menu/save',
        formData,
        config
      ).then((result)=>{
        alert('저장되었습니다');

      })
      .catch(()=>{
        alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
        // window.location.href='/';
      });

  }
}

export default post_ajax;