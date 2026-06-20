    </main>
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
  (function () {
    var html = document.documentElement;
    var icon = document.querySelector('#themeToggle i');
    function syncIcon() {
      if (!icon) return;
      icon.className = html.getAttribute('data-bs-theme') === 'light' ? 'bi bi-sun' : 'bi bi-moon-stars';
    }
    syncIcon();
    var themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', function () {
        var next = html.getAttribute('data-bs-theme') === 'light' ? 'dark' : 'light';
        html.setAttribute('data-bs-theme', next);
        localStorage.setItem('theme', next);
        syncIcon();
      });
    }
    var toggleBtn = document.getElementById('sidebarToggle');
    var sidebar = document.getElementById('sidebar');
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        sidebar.classList.toggle('sidebar-open');
      });
    }
  })();
</script>
<?= $extraScripts ?? '' ?>
</body>
</html>
