const allBtn = document.querySelectorAll(".btn");

allBtn.forEach(function(btn){
  btn.addEventListener("click",function(){
    allBtn.forEach(function(b){
      b.classList.remove("active");
    });
    this.classList.add("active")
  });
});