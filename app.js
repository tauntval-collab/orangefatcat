(function () {
  const config = window.PORTFOLIO;
  const FRAME_MS = 80;
  const SHEET_COLS = 6;

  document.querySelectorAll('[data-bind="handle"]').forEach((el) => {
    if (config.handle) el.textContent = config.handle;
  });
  document.querySelectorAll('[data-bind="status"]').forEach((el) => {
    if (config.status) el.textContent = config.status;
  });
  if (config.handle) document.title = `${config.handle} — Roblox VFX`;
  document.getElementById('year').textContent = new Date().getFullYear();

  function armClip(el, clip) {
    el.dataset.src = `media/${clip.id}.jpg`;
    el.dataset.frames = clip.frames;
  }

  const loader = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target;
      const frames = Number(el.dataset.frames);
      const rows = Math.ceil(frames / SHEET_COLS);
      el.style.backgroundImage = `url("${el.dataset.src}")`;
      el.style.backgroundSize = `${SHEET_COLS * 100}% ${rows * 100}%`;
      el.style.animation = [
        `clip-x ${SHEET_COLS * FRAME_MS}ms steps(${SHEET_COLS}, jump-none) infinite`,
        `clip-y ${rows * SHEET_COLS * FRAME_MS}ms steps(${rows}, jump-none) infinite`,
      ].join(', ');
      loader.unobserve(el);
      player.observe(el);
    }
  }, { rootMargin: '400px' });

  const player = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
    }
  });

  document.querySelectorAll('[data-clip]').forEach((el) => {
    const clip = config.features[el.dataset.clip];
    if (!clip) return;
    armClip(el, clip);
    loader.observe(el);
  });

  function buildGallery(items, grid, filters) {
    const tiles = items.map((item) => {
      const figure = document.createElement('figure');
      figure.className = 'tile';
      figure.dataset.tags = item.tags.join(',');

      const clip = document.createElement('div');
      clip.className = 'clip';
      clip.setAttribute('role', 'img');
      clip.setAttribute('aria-label', `${item.title} — ${item.tags.join(', ')}`);
      armClip(clip, item);

      const caption = document.createElement('figcaption');
      const title = document.createElement('span');
      title.className = 'tile-title';
      title.textContent = item.title;
      const tags = document.createElement('span');
      tags.className = 'tile-tags';
      tags.textContent = item.tags.join(' · ');
      caption.append(title, tags);

      figure.append(clip, caption);
      grid.append(figure);
      loader.observe(clip);
      return figure;
    });

    const allTags = ['All', ...new Set(items.flatMap((item) => item.tags))];
    allTags.forEach((tag, index) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = tag;
      chip.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
      chip.addEventListener('click', () => {
        filters.querySelectorAll('.chip').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
        tiles.forEach((tile) => {
          tile.hidden = tag !== 'All' && !tile.dataset.tags.split(',').includes(tag);
        });
      });
      filters.append(chip);
    });
  }

  buildGallery(config.work, document.getElementById('grid'), document.getElementById('filters'));
  buildGallery(config.effects || [], document.getElementById('fx-grid'), document.getElementById('fx-filters'));

  const contact = config.contact || {};
  const briefText = (config.brief || []).join('\n');
  document.querySelectorAll('[data-bind="discord"]').forEach((el) => {
    if (contact.discordUsername) el.textContent = contact.discordUsername;
  });
  document.getElementById('brief').textContent = briefText;

  const toast = document.getElementById('toast');
  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    }
  }

  const copyables = {
    discord: { text: contact.discordUsername, done: 'Username copied — add me or DM me on Discord' },
    brief: { text: briefText, done: 'Brief copied — paste it into the DM' },
  };

  document.querySelectorAll('[data-copy]').forEach((button) => {
    const item = copyables[button.dataset.copy];
    if (!item || !item.text) { button.hidden = true; return; }
    button.addEventListener('click', async () => {
      const ok = await copyText(item.text);
      showToast(ok ? item.done : item.text);
    });
  });

  const contactLinks = document.getElementById('contact-links');
  const links = [];
  if (contact.discordUrl) links.push({ label: contact.discordLabel || 'DM me on Discord', href: contact.discordUrl });
  if (contact.robloxUrl) links.push({ label: 'Roblox profile', href: contact.robloxUrl });
  if (contact.talentHubUrl) links.push({ label: 'Talent Hub', href: contact.talentHubUrl });
  if (contact.xUrl) links.push({ label: 'X / Twitter', href: contact.xUrl });
  if (contact.email) links.push({ label: contact.email, href: `mailto:${contact.email}` });

  links.forEach((link) => {
    const a = document.createElement('a');
    a.className = 'btn btn-ghost';
    a.href = link.href;
    a.textContent = link.label;
    if (!link.href.startsWith('mailto:')) {
      a.target = '_blank';
      a.rel = 'noopener';
    }
    contactLinks.append(a);
  });
  contactLinks.hidden = links.length === 0;
})();
