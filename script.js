const STORAGE_KEY = 'fandoms';

const DEFAULT_FANDOMS = [
    {
        id: 'ztmy',
        title: 'ZUTOMAYO',
        description: 'Zutto Mayonaka de Iinoni. dengan visual surreal dan musik khas.',
        logoUrl: 'https://i.ytimg.com/vi/sBpITQ7oXxM/hqdefault.jpg',
        backgroundUrl: 'https://i.ytimg.com/vi/JQ2913bVo30/maxresdefault.jpg',
        videoLinks: [
            'https://youtu.be/sBpITQ7oXxM?si=eA6Zvtyl_SRYuy5f',
            'https://youtu.be/JQ2913bVo30?si=yp0z5ojIIZEAVikf',
            'https://youtu.be/IeyCdm9WwXM?si=TaKFUV6vMb3Gnp5h',
            'https://youtu.be/PLG2Uexyi9s?si=vAYT0FCU6YjFQED8'
        ]
    },
    {
        id: 'ado',
        title: 'ADO',
        description: 'Vokal powerful dan visual futuristik dari Ado.',
        logoUrl: 'https://i.ytimg.com/vi/Qp3b-RXtz4w/hqdefault.jpg',
        backgroundUrl: 'https://i.ytimg.com/vi/pgXpM4l_MwI/maxresdefault.jpg',
        videoLinks: [
            'https://youtu.be/Qp3b-RXtz4w',
            'https://youtu.be/YnSW8ian29w',
            'https://youtu.be/pgXpM4l_MwI',
            'https://youtu.be/1FliVTv8lsE'
        ]
    },
    {
        id: 'chogakusei',
        title: 'CHOGAKUSEI',
        description: 'Cover artist dengan tone rendah yang khas dan produksi gelap.',
        logoUrl: 'https://i.ytimg.com/vi/uT35Y5FqD4I/hqdefault.jpg',
        backgroundUrl: 'https://i.ytimg.com/vi/vVj4wEq8XU4/maxresdefault.jpg',
        videoLinks: [
            'https://youtu.be/uT35Y5FqD4I',
            'https://youtu.be/vVj4wEq8XU4',
            'https://youtu.be/3g5Yy_S1EWE',
            'https://youtu.be/GqKWeL7xofY'
        ]
    }
];

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

const parseLinks = (text) => text
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const createId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `fandom-${Date.now()}`;
};

const ensureDefaults = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FANDOMS));
        return [...DEFAULT_FANDOMS];
    }

    try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            return parsed;
        }
    } catch (_error) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FANDOMS));
        return [...DEFAULT_FANDOMS];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FANDOMS));
    return [...DEFAULT_FANDOMS];
};

const saveFandoms = (fandoms) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fandoms));
};

const setBodyBackground = (url) => {
    document.body.style.backgroundImage = url ? `url(${url})` : 'none';
};

const initLoader = () => {
    const bar = document.getElementById('progress-bar');
    const wrapper = document.getElementById('loader-wrapper');

    if (!bar || !wrapper) {
        return;
    }

    bar.style.width = '100%';

    setTimeout(() => {
        wrapper.classList.add('loaded');
        document.body.style.overflow = 'auto';
    }, 800);
};

const initSlider = (videoLinks) => {
    const stage = document.getElementById('yt-stage');
    const prevBtn = document.querySelector('.yt-nav-prev');
    const nextBtn = document.querySelector('.yt-nav-next');
    const isFileProtocol = window.location.protocol === 'file:';

    if (!stage || !prevBtn || !nextBtn) {
        return;
    }

    const validVideos = (videoLinks || [])
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

    if (!validVideos.length) {
        stage.innerHTML = '<div class="text-center py-5">Belum ada video.</div>';
        return;
    }

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

    const slides = Array.from(stage.querySelectorAll('.yt-card'));
    if (!slides.length) {
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
};

const initIndexPage = () => {
    const cardsContainer = document.getElementById('cards-container');
    const form = document.getElementById('fandom-form');
    const emptyState = document.getElementById('empty-state');
    const toggleButton = document.getElementById('toggle-form-btn');
    const cancelEditButton = document.getElementById('cancel-edit-btn');
    const collapseElement = document.getElementById('fandom-form-collapse');

    if (!cardsContainer || !form) {
        return;
    }

    const collapseInstance = collapseElement && window.bootstrap
        ? new bootstrap.Collapse(collapseElement, { toggle: false })
        : null;

    let fandoms = ensureDefaults();

    const titleInput = document.getElementById('fandom-title-input');
    const descriptionInput = document.getElementById('fandom-description-input');
    const logoInput = document.getElementById('fandom-logo-input');
    const backgroundInput = document.getElementById('fandom-background-input');
    const linksInput = document.getElementById('fandom-links-input');
    const idInput = document.getElementById('fandom-id');
    const submitButton = document.getElementById('fandom-submit');

    const resetForm = () => {
        form.reset();
        idInput.value = '';
        submitButton.textContent = 'Add Another Fandom';
    };

    const showForm = () => {
        if (collapseInstance) {
            collapseInstance.show();
        } else if (collapseElement) {
            collapseElement.classList.add('show');
        }
        if (toggleButton) {
            toggleButton.textContent = 'Close Form';
            toggleButton.setAttribute('aria-expanded', 'true');
        }
    };

    const hideForm = () => {
        if (collapseInstance) {
            collapseInstance.hide();
        } else if (collapseElement) {
            collapseElement.classList.remove('show');
        }
        if (toggleButton) {
            toggleButton.textContent = 'Add Another Fandom';
            toggleButton.setAttribute('aria-expanded', 'false');
        }
        resetForm();
    };

        const getFallbackImage = (links, fallback) => {
        const firstId = getYoutubeId((links || [])[0] || '');
        if (firstId) {
            return `https://i.ytimg.com/vi/${firstId}/hqdefault.jpg`;
        }
        return fallback;
    };

    const renderCards = () => {
        cardsContainer.innerHTML = '';

        if (!fandoms.length) {
            emptyState?.classList.remove('d-none');
            return;
        }

        emptyState?.classList.add('d-none');

        fandoms.forEach((fandom) => {
            const col = document.createElement('div');
            col.className = 'col';
            const fallbackLogo = getFallbackImage(fandom.videoLinks, 'https://placehold.co/640x360?text=Fandom');
            const cardImage = fandom.logoUrl || fallbackLogo;
            const card = document.createElement('div');
            card.className = 'card fandom-card h-100';
            card.dataset.id = fandom.id;
            card.innerHTML = `
                <img src="${cardImage}" class="card-img-top" alt="${fandom.title}">
                <div class="card-body">
                    <h5 class="card-title">${fandom.title}</h5>
                    <p class="card-text">${fandom.description}</p>
                </div>
                <div class="card-footer bg-transparent border-0 d-flex justify-content-end gap-2">
                    <button class="btn btn-link btn-sm" data-action="edit">Edit</button>
                    <button class="btn btn-link btn-sm" data-action="delete">Delete</button>
                </div>
            `;
            col.appendChild(card);
            cardsContainer.appendChild(col);
        });
    };

    const setFormValues = (fandom) => {
        idInput.value = fandom.id;
        titleInput.value = fandom.title;
        descriptionInput.value = fandom.description;
        logoInput.value = fandom.logoUrl || '';
        backgroundInput.value = fandom.backgroundUrl || '';
        linksInput.value = (fandom.videoLinks || []).join('\n');
        submitButton.textContent = 'Save Changes';
        showForm();
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const newLinks = parseLinks(linksInput.value);

        const payload = {
            id: idInput.value || createId(),
            title: titleInput.value.trim(),
            description: descriptionInput.value.trim(),
            logoUrl: logoInput.value.trim(),
            backgroundUrl: backgroundInput.value.trim(),
            videoLinks: newLinks
        };

        if (idInput.value) {
            fandoms = fandoms.map((item) => (item.id === payload.id ? payload : item));
        } else {
            fandoms = [payload, ...fandoms];
        }

        saveFandoms(fandoms);
        renderCards();
        hideForm();
    };

    form.addEventListener('submit', handleSubmit);

    cardsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const card = target.closest('.fandom-card');
        if (!card) {
            return;
        }

        const fandom = fandoms.find((item) => item.id === card.dataset.id);
        if (!fandom) {
            return;
        }

        if (target.dataset.action === 'edit') {
            event.stopPropagation();
            setFormValues(fandom);
            return;
        }

        if (target.dataset.action === 'delete') {
            event.stopPropagation();
            if (confirm(`Delete fandom "${fandom.title}"?`)) {
                fandoms = fandoms.filter((item) => item.id !== fandom.id);
                saveFandoms(fandoms);
                renderCards();
            }
            return;
        }

        window.location.href = `fandom.html?id=${fandom.id}`;
    });

    toggleButton?.addEventListener('click', () => {
        if (!collapseElement) {
            return;
        }
        const isOpen = collapseElement.classList.contains('show');
        if (isOpen) {
            hideForm();
        } else {
            showForm();
        }
    });

    cancelEditButton?.addEventListener('click', () => {
        hideForm();
    });

    renderCards();
};

const initFandomPage = () => {
    const titleEl = document.getElementById('fandom-title');
    const descEl = document.getElementById('fandom-description');
    const logoEl = document.getElementById('fandom-logo');

    if (!titleEl || !descEl || !logoEl) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const fandomId = params.get('id');
    const fandoms = ensureDefaults();
    const fandom = fandoms.find((item) => item.id === fandomId) || fandoms[0];

    if (!fandom) {
        window.location.href = 'index.html';
        return;
    }

    titleEl.textContent = fandom.title;
    titleEl.dataset.text = fandom.title;
    descEl.textContent = fandom.description;
    logoEl.src = fandom.logoUrl || '';
    logoEl.alt = `${fandom.title} logo`;
    document.title = fandom.title;
    setBodyBackground(fandom.backgroundUrl || fandom.logoUrl || '');

    initSlider(fandom.videoLinks || []);
};

window.addEventListener('load', () => {
    initLoader();
    initIndexPage();
    initFandomPage();
});
