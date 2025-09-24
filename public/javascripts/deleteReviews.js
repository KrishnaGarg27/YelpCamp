const deleteButtons = document.querySelectorAll(".delete-review-btn");
deleteButtons.forEach((deleteButton) => {
  deleteButton.addEventListener("click", function (e) {
    e.preventDefault();
    const campgroundId = deleteButton.getAttribute("campground-id");
    const reviewId = deleteButton.getAttribute("review-id");
    fetch(`/campgrounds/${campgroundId}/reviews/${reviewId}`, {
      method: "DELETE",
      credentials: "same-origin",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "success") {
          const review = document.querySelector(`#id${res.reviewId}`);
          review.remove();
        }
      });
  });
});
