var businesses;


$(document).ready(function () {
  var path = window.location.pathname;
  var d = { "location": window.location.search.substring(3) };

  $.ajax({
    type: "POST",
    url: "/api" + path,
    data: d,
    dataType: "json",
    success: function (r) {
      businesses = r.businesses;
      businesses.forEach(function (bus, index) {
        let h = `
          <div class="row my-2">
            <div class="col-12 col-sm-12 col-md-2">
              <image class="img-fluid business-img" src=${bus.image_url}/>
            </div>
            <div class="col-12 col-sm-12 col-md-6">
              <div class="row">
                <div class="col-12">${bus.name}</div>
                <div class="col-12">
                  ${bus.categories[0].title}, ${bus.categories[1].title}...
                </div>
                <div class="col-12">${bus.display_phone}</div>
              </div>
            </div>
            <div class="col-12 col-sm-12 col-md-2">
              <div class="row">
                <div class="col-12">${bus.rating}/5.0</div>
                <div class="col-12">${bus.review_count}</div>
                <div class="col-12">${bus.price}</div>
              </div>
            </div>
            <div class="col-12 col-sm-12 col-md-2">
              <button class="btn btn-primary btn-block going-btn" id="going-${index}" type="button" onclick={handleGoing(${index})}>Going</button>
            </div>
          </div>
        `;

        $("#res").append(h);
      });
      $("#res").append(r.businesses[0]);
    },
    error: function (err) {
      console.log(err);
    }
  });
});


function handleGoing(index) {
  $(`#going-${index}`).attr("disabled", "disabled");
  var d = { "yelp_id": businesses[index].id };
  console.log(d);
  $.ajax({
    type: "POST",
    url: "/api/:id/going/",
    data: d,
    dataType: "json",
    success: function (res) {
      console.log(res);
      $(`#going-${index}`).removeAttr("disabled");
    },
    error: function (err) {
      if (err) window.location.href = "/login/";
    }
  });
}
