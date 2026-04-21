try {
  var stored = localStorage.getItem("theme");
  var wantsDark = stored ? stored === "dark" : true;
  document.documentElement.classList.toggle("dark", wantsDark);
} catch (_) {
  document.documentElement.classList.add("dark");
}
