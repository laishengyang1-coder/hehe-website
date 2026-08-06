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

    /* ---------- 站内搜索（纯前端索引） ---------- */
    const searchBtn = document.querySelector('.search-box button');
    const searchInput = document.querySelector('.search-box input');
    if (searchBtn && searchInput) {
        const SITE_INDEX = [
            { t: '首页', d: '和和新材 · 全链车膜工厂', u: 'index.html', k: ['首页','和和','车膜','工厂','新材','hehe','主页'] },
            { t: '关于和和', d: '公司介绍 · 发展历程 · 企业文化', u: 'about.html', k: ['关于','公司','介绍','发展','文化','历程','荣誉','资质'] },
            { t: '产品应用', d: '隐形车衣 · 改色车衣 · 太阳膜 · 天窗冰甲', u: 'product.html', k: ['产品','隐形车衣','改色','太阳膜','天窗','冰甲','新能源','电池','膜材','tpu'] },
            { t: '品牌世界', d: '和膜 · 和膜和彩 · KAKA', u: 'brand.html', k: ['品牌','和膜','和彩','kaka','卡卡'] },
            { t: '创新中心', d: '偃月实验室 · 研发实力', u: 'innovation.html', k: ['创新','研发','实验','技术','偃月','专利'] },
            { t: '新闻资讯', d: '公司动态 · 行业资讯', u: 'news.html', k: ['新闻','资讯','动态','行业','展会'] },
            { t: '联系我们', d: '留言咨询 · 联系方式', u: 'contact.html', k: ['联系','留言','电话','地址','咨询','客服','邮箱'] },
        ];

        const panel = document.createElement('div');
        panel.className = 'search-panel';
        panel.style.cssText = 'position:fixed;top:72px;left:50%;transform:translateX(-50%);width:min(560px,92vw);background:#161617;border:1px solid rgba(232,226,214,.14);border-radius:10px;box-shadow:0 24px 60px rgba(0,0,0,.55);z-index:9999;max-height:62vh;overflow:auto;display:none;';
        document.body.appendChild(panel);

        function doSearch(kw) {
            const q = kw.toLowerCase().trim();
            if (!q) { panel.style.display = 'none'; return; }
            const hits = SITE_INDEX.filter(function (it) {
                return it.t.toLowerCase().includes(q) ||
                       it.d.toLowerCase().includes(q) ||
                       it.k.some(function (k) { return k.toLowerCase().includes(q); });
            });
            if (!hits.length) {
                panel.innerHTML = '<div style="padding:20px;color:#8a857b;font-size:.88rem;font-family:Inter,sans-serif;">未找到与「' + kw + '」相关的内容，试试「产品」「品牌」等关键词</div>';
            } else {
                panel.innerHTML = hits.map(function (h) {
                    return '<a href="' + h.u + '" style="display:block;padding:15px 20px;border-bottom:1px solid rgba(232,226,214,.08);text-decoration:none;transition:background .2s;" onmouseover="this.style.background=\'rgba(233,72,26,.08)\'" onmouseout="this.style.background=\'transparent\'">' +
                        '<div style="color:#e8e2d6;font-size:.95rem;font-weight:600;font-family:\'Noto Serif SC\',serif;">' + h.t + '</div>' +
                        '<div style="color:#8a857b;font-size:.8rem;margin-top:3px;font-family:Inter,sans-serif;">' + h.d + '</div></a>';
                }).join('') + '<div style="padding:10px 20px;color:#6b675f;font-size:.75rem;font-family:Inter,sans-serif;">共 ' + hits.length + ' 条结果</div>';
            }
            panel.style.display = 'block';
        }

        searchBtn.addEventListener('click', function () { doSearch(searchInput.value); });
        searchInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') doSearch(searchInput.value); });
        searchInput.addEventListener('input', function () { doSearch(searchInput.value); });
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.search-box') && !e.target.closest('.search-panel')) panel.style.display = 'none';
        });
    }

    /* ---------- 联系表单提交（CloudBase 云函数） ---------- */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        // 默认走静态托管路由 /api/contact（同源）；
        // 若改用云函数 HTTP 访问服务，在 <form data-api="..."> 填独立地址即可
        const API_URL = contactForm.getAttribute('data-api') || '/api/contact';

        /* ---------- 简单算式验证码 ---------- */
        const captchaBox = document.getElementById('captchaBox');
        const captchaRefresh = document.getElementById('captchaRefresh');
        let captchaAnswer = 0;
        function newCaptcha() {
            const a = Math.floor(Math.random() * 8) + 2;
            const b = Math.floor(Math.random() * 8) + 2;
            captchaAnswer = a + b;
            if (captchaBox) captchaBox.textContent = a + ' + ' + b + ' = ?';
            const inp = contactForm.querySelector('input[name="captcha"]');
            if (inp) inp.value = '';
        }
        newCaptcha();
        if (captchaRefresh) captchaRefresh.addEventListener('click', newCaptcha);

        let resultTip = contactForm.querySelector('.submit-result');
        if (!resultTip) {
            resultTip = document.createElement('p');
            resultTip.className = 'submit-result';
            resultTip.style.cssText = 'margin-top:16px;font-size:.9rem;min-height:1.2em;';
            contactForm.appendChild(resultTip);
        }
        function showTip(msg, ok) {
            resultTip.textContent = msg;
            resultTip.style.color = ok ? '#e8e2d6' : '#ff6b6b';
        }

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const original = btn.textContent;
            btn.disabled = true;
            btn.textContent = '提交中...';

            const data = Object.fromEntries(new FormData(contactForm).entries());
            if (!data.name || !data.phone || !data.message) {
                showTip('请填写姓名、电话和留言内容', false);
                btn.disabled = false; btn.textContent = original;
                return;
            }
            // 验证码校验
            if (parseInt(data.captcha, 10) !== captchaAnswer) {
                showTip('验证码不正确，请重新计算', false);
                newCaptcha();
                btn.disabled = false; btn.textContent = original;
                return;
            }

            try {
                const r = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const j = await r.json().catch(() => ({ ok: false, msg: '返回数据解析失败' }));
                if (j.ok) {
                    contactForm.reset();
                    showTip('✅ ' + (j.msg || '提交成功，我们会尽快联系您'), true);
                } else {
                    showTip('❌ ' + (j.msg || '提交失败，请稍后重试'), false);
                }
            } catch (err) {
                showTip('❌ 网络错误，请稍后重试', false);
            } finally {
                btn.disabled = false; btn.textContent = original;
            }
        });
    }
});
