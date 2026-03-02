window.addEventListener('load', () => {
    // Tambahkan / hapus link video di sini.
    const VIDEO_LINKS = [
        'https://youtu.be/sBpITQ7oXxM?si=eA6Zvtyl_SRYuy5f',
        'https://youtu.be/JQ2913bVo30?si=yp0z5ojIIZEAVikf',
        'https://youtu.be/IeyCdm9WwXM?si=TaKFUV6vMb3Gnp5h',
        'https://youtu.be/PLG2Uexyi9s?si=vAYT0FCU6YjFQED8'
    ];

    const bar = document.getElementById('progress-bar');
    const wrapper = document.getElementById('loader-wrapper');

    if (!bar || !wrapper) {
        return;
    }

    // 1) Fill the bar to 100%
    bar.style.width = '100%';

    // 2) Wait for the bar transition, then split panels
    setTimeout(() => {
        wrapper.classList.add('loaded');
        document.body.style.overflow = 'auto';
    }, 800);

    const stage = document.getElementById('yt-stage');
    const linkList = document.getElementById('video-link-list');
    const isFileProtocol = window.location.protocol === 'file:';
    if (!stage) {
        return;
    }

    const getYoutubeId = (url) => {
        try {
            const parsed = new URL(url);

            if (parsed.hostname.includes('youtu.be')) {
                return parsed.pathname.replace('/', '').trim();
            }

            if (parsed.pathname === '/watch') {
                return parsed.searchParams.get('v');
            }

            if (parsed.pathname.startsWith('/embed/')) {
                return parsed.pathname.split('/embed/')[1]?.split('?')[0] || null;
            }

            if (parsed.pathname.startsWith('/shorts/')) {
                return parsed.pathname.split('/shorts/')[1]?.split('?')[0] || null;
            }
        } catch (_error) {
            return null;
        }

        return null;
    };

    const toEmbedUrl = (videoId) => {
        // Error 153 sering muncul saat dibuka via file:// (tanpa origin/referer).
        // Gunakan domain embed standar + origin jika tersedia.
        const base = `https://www.youtube.com/embed/${videoId}`;
        const params = new URLSearchParams({
            rel: '0',
            modestbranding: '1',
            playsinline: '1',
            enablejsapi: '1'
        });

        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
            params.set('origin', window.location.origin);
        }

        return `${base}?${params.toString()}`;
    };

    const validVideos = VIDEO_LINKS
        .map((url, index) => {
            const id = getYoutubeId(url);
            return {
                index,
                url,
                id,
                embedUrl: id ? toEmbedUrl(id) : null
            };
        })
        .filter((item) => item.embedUrl);

    stage.innerHTML = validVideos
        .map((item, idx) => `
            <article class="yt-card ${idx === 0 ? 'is-active' : ''}" data-index="${idx}">
                ${isFileProtocol ? `
                    <a class="yt-fallback" href="${item.url}" target="_blank" rel="noopener noreferrer" style="background-image: url('https://i.ytimg.com/vi/${item.id}/hqdefault.jpg');" aria-label="Open YouTube video ${idx + 1}">
                        <span class="yt-fallback-overlay"></span>
                    </a>
                ` : `
                    <iframe
                        src="${item.embedUrl}"
                        title="YouTube video ${idx + 1}"
                        loading="lazy"
                        referrerpolicy="origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                    ></iframe>
                `}
            </article>
        `)
        .join('');

    if (linkList) {
        linkList.innerHTML = VIDEO_LINKS
            .map((url) => `<li><a href="${url}" target="_blank" rel="noopener noreferrer" class="link-light">${url}</a></li>`)
            .join('');
    }

    const slides = Array.from(stage.querySelectorAll('.yt-card'));
    const prevBtn = document.querySelector('.yt-nav-prev');
    const nextBtn = document.querySelector('.yt-nav-next');

    if (!slides.length || !prevBtn || !nextBtn) {
        return;
    }

    let current = 0;
    const total = slides.length;

    const normalizeDiff = (value) => {
        let diff = value;
        if (diff > total / 2) diff -= total;
        if (diff < -total / 2) diff += total;
        return diff;
    };

    const updateSlider = () => {
        slides.forEach((slide, index) => {
            const diff = normalizeDiff(index - current);

            slide.classList.remove('is-left', 'is-right', 'is-active', 'is-hidden');

            if (diff === 0) {
                slide.classList.add('is-active');
            } else if (diff === -1) {
                slide.classList.add('is-left');
            } else if (diff === 1) {
                slide.classList.add('is-right');
            } else {
                slide.classList.add('is-hidden');
            }
        });
    };

    prevBtn.addEventListener('click', () => {
        current = (current - 1 + total) % total;
        updateSlider();
    });

    nextBtn.addEventListener('click', () => {
        current = (current + 1) % total;
        updateSlider();
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            current = (current - 1 + total) % total;
            updateSlider();
        } else if (event.key === 'ArrowRight') {
            current = (current + 1) % total;
            updateSlider();
        }
    });

    updateSlider();
});
