/* ============================================
   和和新材 H&H — Interactions v2.0
   揭示动画 · 数字计数 · 视差 · 智能导航
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

    /* ---------- 页面加载完成 → 触发英雄区揭示 ---------- */
    window.addEventListener('load', function () {
        document.body.classList.add('loaded');
    });
    // 兜底：1.2s 后强制显示，防止视频加载慢阻塞动画
    setTimeout(function () {
        document.body.classList.add('loaded');
    }, 1200);

    /* ---------- 导航栏：滚动态 + 下滑隐藏/上滑显示 ---------- */
    const header = document.querySelector('.header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function handleHeader() {
        const y = window.scrollY;
        if (y > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            header.classList.remove('hidden');
        }
        // 仅在有英雄区的页面做隐藏逻辑，子页面常驻
        const isHome = document.querySelector('.hero');
        if (isHome && y > 500) {
            if (y > lastScrollY + 4) {
                header.classList.add('hidden');
            } else if (y < lastScrollY - 4) {
                header.classList.remove('hidden');
            }
        }
        lastScrollY = y;
        ticking = false;
    }

    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(handleHeader);
            ticking = true;
        }
    }, { passive: true });
    handleHeader();

    /* ---------- 移动端菜单 ---------- */
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function () {
            menuToggle.classList.toggle('active');
            nav.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link, .dropdown a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 992 && !this.parentElement.classList.contains('has-dropdown')) {
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        });
    }

    /* ---------- 品牌轮播 ---------- */
    const brandSlides = document.querySelectorAll('.brand-slide');
    const brandDots = document.querySelectorAll('.brand-dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        brandSlides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === index);
        });
        brandDots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
        currentSlide = index;
    }

    function nextSlide() {
        showSlide((currentSlide + 1) % brandSlides.length);
    }

    if (brandSlides.length > 0) {
        showSlide(0);
        slideInterval = setInterval(nextSlide, 5000);

        brandDots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                clearInterval(slideInterval);
                showSlide(index);
                slideInterval = setInterval(nextSlide, 5000);
            });
        });

        // 悬停暂停轮播
        const slider = document.querySelector('.brand-slider');
        if (slider) {
            slider.addEventListener('mouseenter', function () { clearInterval(slideInterval); });
            slider.addEventListener('mouseleave', function () { slideInterval = setInterval(nextSlide, 5000); });
        }
    }

    /* ---------- 进入视口揭示动画（兼容 .fade-in 与 [data-reveal]） ---------- */
    const revealSelector = '.fade-in, [data-reveal]';

    function markVisible(el) {
        el.classList.add('visible');
        el.classList.add('revealed');
    }

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    markVisible(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

        function observeReveals(root) {
            root.querySelectorAll(revealSelector).forEach(function (el) {
                if (!el.classList.contains('revealed')) revealObserver.observe(el);
            });
        }
        observeReveals(document);

        // 子页面有动态注入的内容（如 product.html 的其他产品卡片），监听后补观察
        const mo = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    if (node.matches && node.matches(revealSelector)) revealObserver.observe(node);
                    if (node.querySelectorAll) observeReveals(node);
                });
            });
        });
        mo.observe(document.body, { childList: true, subtree: true });
    } else {
        document.querySelectorAll(revealSelector).forEach(markVisible);
    }

    /* ---------- 数字计数器 ---------- */
    const counters = document.querySelectorAll('[data-count]');

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'), 10);
        const duration = 1600;
        const start = performance.now();

        function step(now) {
            const progress = Math.min((now - start) / duration, 1);
            // easeOutExpo
            const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            el.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    if (counters.length > 0 && 'IntersectionObserver' in window) {
        const counterObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(function (el) { counterObserver.observe(el); });
    } else {
        counters.forEach(function (el) {
            el.textContent = el.getAttribute('data-count');
        });
    }

    /* ---------- 视差滚动 ---------- */
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    let parallaxTicking = false;

    function updateParallax() {
        parallaxEls.forEach(function (el) {
            const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
            const rect = el.parentElement.getBoundingClientRect();
            if (rect.bottom > 0 && rect.top < window.innerHeight) {
                const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed;
                el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
            }
        });
        parallaxTicking = false;
    }

    if (parallaxEls.length > 0 && window.innerWidth > 992) {
        window.addEventListener('scroll', function () {
            if (!parallaxTicking) {
                window.requestAnimationFrame(updateParallax);
                parallaxTicking = true;
            }
        }, { passive: true });
        updateParallax();
    }

    /* ---------- 返回顶部 ---------- */
    const backToTop = document.querySelector('.sidebar-item.top');
    if (backToTop) {
        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ---------- 联系表单 ---------- */
    const contactForm = document.querySelector('#contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            alert('感谢您的留言！我们会尽快与您联系。');
            contactForm.reset();
        });
    }

    /* ---------- 搜索 ---------- */
    const searchBtn = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-box input');
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function () {
            const keyword = searchInput.value.trim();
            if (keyword) {
                alert('搜索: ' + keyword + '\n（搜索功能待部署后端后启用）');
            }
        });
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') searchBtn.click();
        });
    }
});
