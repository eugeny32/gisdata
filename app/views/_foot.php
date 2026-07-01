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
    var backdrop = document.getElementById('sidebarBackdrop');
    function closeSidebar() {
      if (!sidebar) return;
      sidebar.classList.remove('sidebar-open');
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    }
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function () {
        var isOpen = sidebar.classList.toggle('sidebar-open');
        if (backdrop) backdrop.classList.toggle('show', isOpen);
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });
    }
    if (backdrop) backdrop.addEventListener('click', closeSidebar);
    // Закрываем сайдбар при клике по ссылке меню на мобильных
    if (sidebar) {
      sidebar.querySelectorAll('.sidebar-link').forEach(function (link) {
        link.addEventListener('click', function () {
          if (window.innerWidth < 992) closeSidebar();
        });
      });
    }
  })();
</script>
<?= $extraScripts ?? '' ?>
</body>
</html>
