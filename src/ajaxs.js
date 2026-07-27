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

    axios.post(process.env.REACT_APP_API_KEY+'Admin/Basic/save', formData, config).then((result)=>{
      console.log(result);
      alert('저장되었습니다');
    }).catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
      window.location.href = '/';
    });
  
  }else if(whats === 'property'){

    axios.post(
      process.env.REACT_APP_API_KEY+'Admin/FunctionMenu/save_property',
      formData,
      config
    )
    .then((result)=>{
      console.log("저장하기", result.data);
      console.log(typeof result.data);
      alert('저장되었습니다');
    })
    .catch(()=>{
      alert('서버와의 연결이 끊겼습니다. 잠시 후 다시 시도해주십시오.');
      window.location.href='/';
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
      )

    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }

  }
}

export default post_ajax;