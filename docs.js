document.addEventListener('DOMContentLoaded', () => {

    // --------------------------------------------------------------------------
    // Scrollspy Logic
    // --------------------------------------------------------------------------
    const sections = document.querySelectorAll('.docs-section');
    const navLinks = document.querySelectorAll('.docs-toc-list a');
    const progressBar = document.querySelector('.reading-progress');

    // Update Progress Bar
    window.addEventListener('scroll', () => {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }
    });

    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px', // Trigger when section is near top
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active from all
                navLinks.forEach(link => link.classList.remove('active'));

                // Add active to current
                const id = entry.target.getAttribute('id');
                const matchingLink = document.querySelector(`.docs-toc-list a[href="#${id}"]`);
                if (matchingLink) {
                    matchingLink.classList.add('active');
                }
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });


    // --------------------------------------------------------------------------
    // Copy Code Logic
    // --------------------------------------------------------------------------
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const codeBlock = btn.closest('.docs-code-block');
            const code = codeBlock.querySelector('code').innerText;

            navigator.clipboard.writeText(code).then(() => {
                // Show check icon
                const copyIcon = btn.querySelector('.copy-icon');
                const checkIcon = btn.querySelector('.check-icon');

                copyIcon.style.display = 'none';
                checkIcon.style.display = 'block';
                btn.classList.add('copied');

                // Revert after 2s
                setTimeout(() => {
                    copyIcon.style.display = 'block';
                    checkIcon.style.display = 'none';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });


    // --------------------------------------------------------------------------
    // CLI Typing Effect
    // --------------------------------------------------------------------------
    const typingElement = document.querySelector('.typing-text');
    const cliOutput = document.querySelector('.cli-output');

    if (typingElement) {
        const text = typingElement.getAttribute('data-text');
        let index = 0;

        function type() {
            if (index < text.length) {
                typingElement.textContent += text.charAt(index);
                index++;
                setTimeout(type, Math.random() * 50 + 50); // Random delay 50-100ms
            } else {
                // Done typing
                setTimeout(() => {
                    if (cliOutput) cliOutput.style.display = 'block';
                }, 400);
            }
        }

        // Start typing when visible
        const cliObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setTimeout(type, 500); // Small delay before starting
                cliObserver.disconnect();
            }
        });

        cliObserver.observe(document.querySelector('.docs-cli-window'));
    }


    // --------------------------------------------------------------------------
    // Mobile Sidebar & Overlay
    // --------------------------------------------------------------------------
    const tocToggle = document.querySelector('.docs-mobile-toc-toggle');
    const sidebar = document.querySelector('.docs-sidebar');
    const closeBtn = document.querySelector('.docs-sidebar-close');
    const overlay = document.querySelector('.docs-mobile-overlay');

    function openSidebar() {
        sidebar.classList.add('is-open');
        overlay.classList.add('is-visible');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('is-open');
        overlay.classList.remove('is-visible');
        document.body.style.overflow = '';
    }

    if (tocToggle && sidebar) {
        tocToggle.addEventListener('click', openSidebar);

        if (closeBtn) {
            closeBtn.addEventListener('click', closeSidebar);
        }

        if (overlay) {
            overlay.addEventListener('click', closeSidebar);
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && sidebar.classList.contains('is-open')) {
                closeSidebar();
            }
        });

        // Close when clicking a link on mobile
        sidebar.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    closeSidebar();
                }
            });
        });
    }

    // --------------------------------------------------------------------------
    // Anchor Link Generator (H2, H3)
    // --------------------------------------------------------------------------
    const headings = document.querySelectorAll('.docs-section h2, .docs-section h3');
    headings.forEach(heading => {
        // Only if it doesn't already have an anchor
        if (!heading.querySelector('.anchor-link')) {
            const id = heading.closest('section').id; // Use section ID if available
            // If heading has own ID, use that, otherwise use section ID + slug
            let anchorId = heading.id || (id ? id : null);

            // For h3 inside a section, we might need a specific ID if not present
            if (!heading.id && id && heading.tagName === 'H3') {
                const slug = heading.textContent.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                anchorId = slug; // Just use slug for simplicity or section-slug
                heading.id = anchorId;
            }

            if (anchorId) {
                const anchor = document.createElement('a');
                anchor.className = 'anchor-link';
                anchor.href = `#${anchorId}`;
                anchor.innerHTML = '#';
                anchor.ariaLabel = 'Direct link to this section';
                heading.prepend(anchor);
            }
        }
    });

});
