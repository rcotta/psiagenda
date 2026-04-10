$(function () {
  const screenSelector = ".screen";
  const toast = $("#toast");

  function showScreen(screenId) {
    $(screenSelector).removeClass("active");
    $(`#${screenId}`).addClass("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message) {
    toast.text(message).addClass("show");
    setTimeout(() => {
      toast.removeClass("show");
    }, 1800);
  }

  $("#login-form").on("submit", function (event) {
    event.preventDefault();
    showScreen("screen-home");
    showToast("Login realizado no modo protótipo.");
  });

  $(".nav-link").on("click", function () {
    const target = $(this).data("target");
    if (!target) return;
    showScreen(target);
  });

  $(".save-feedback").on("click", function () {
    showToast("Dados salvos apenas para demonstração.");
  });
});
