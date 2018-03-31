var bus;

$(document).ready(function () {
  var path = window.location.pathname;
  var d = { "location": window.location.search.substring(3) };

  $.ajax({
    type: "POST",
    url: "/api" + path,
    data: d,
    dataType: "json",
    success: function (r) {
      if (!r.empty) {
        bus = r;
        for (var i = 0; i < bus.businesses.length; i++) {
          let h = `
            <div class="row my-2">
              <div class="col-12 col-sm-12 col-md-2">
                <image class="img-fluid business-img" src=${bus.businesses[i].image_url}/>
              </div>
              <div class="col-12 col-sm-12 col-md-6">
                <div class="row">
                  <div class="col-12">${bus.businesses[i].name}</div>
                  <div class="col-12">
                    ${bus.businesses[i].categories[0].title}, ${bus.businesses[i].categories[1].title}...
                  </div>
                  <div class="col-12">${bus.businesses[i].display_phone}</div>
                </div>
              </div>
              <div class="col-12 col-sm-12 col-md-2">
                <div class="row">
                  <div class="col-12">${bus.businesses[i].rating}/5.0</div>
                  <div class="col-12">${bus.businesses[i].review_count}</div>
                  <div class="col-12">${bus.businesses[i].price}</div>
                </div>
              </div>
              <div class="col-12 col-sm-12 col-md-2">
                <button class="btn btn-primary btn-block going-btn" id="going-${i}" type="button" onclick={handleGoing(${i})}>${bus.going[i].length} Going</button>
              </div>
            </div>
          `;

          $("#res").append(h);
        }
      }
    },
    error: function (err) {
      console.log(err);
    }
  });
});


function handleGoing(index) {
  $(`#going-${index}`).attr("disabled", "disabled");
  var d = { "yelp_id": bus.businesses[index].id };
  $.ajax({
    type: "POST",
    url: "/api/:id/going/",
    data: d,
    dataType: "json",
    success: function (res) {
      $(`#going-${index}`).html(`${res.going.length} Going`);
      $(`#going-${index}`).removeAttr("disabled");
    },
    error: function (err) {
      if (err) window.location.href = "/login/";
    }
  });
}
