function addToCart(id) {
  console.log('working')
  console.log('id: ',id)
  

  $.ajax({
    url:'/add-to-cart',
    method:'post',
    encoded:true,
    data:{
      productId:id
    }
  }).done((data)=>{
    console.log(data);
    if(data.success){
      window.location.reload();
    }
  })
  }


