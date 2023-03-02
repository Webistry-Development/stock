import { 
  transformLinkToAnimation,
  createTag,
  decorateBlockAnalytics,
} from '../../scripts/utils.js';

function lazyDecorateVideo(cell, a) {
  if (!a || (!a.href.endsWith('.mp4'))) return;
  const decorateVideo = () => {
    if (cell.classList.contains('picture-column')) return;
    let mp4 = null;
    if (a.href.endsWith('.mp4')) {
      mp4 = transformLinkToAnimation(a);
    }
    cell.innerHTML = '';
    if (mp4) {
      const row = cell.closest('.featured-row');
      const cta = row.querySelector('.button.accent') ?? row.querySelector('.button');
      if (cta) {
        const a = createTag('a', {
          href: cta.href, title: cta.title, target: cta.target, rel: cta.rel,
        });
        cell.appendChild(a);
        a.appendChild(mp4);
      } else {
        cell.appendChild(mp4);
      }
      cell.classList.add('picture-column');
    }
  };
  const addIntersectionObserver = (block) => {
    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.intersectionRatio > 0 || entry.isIntersecting) {
        decorateVideo();
      }
    }, {
      root: null,
      rootMargin: '300px',
      threshold: 0,
    });
    intersectionObserver.observe(block);
  };
  if (document.readyState === 'complete') {
    addIntersectionObserver(cell);
  } else {
    window.addEventListener('load', () => {
      addIntersectionObserver(cell);
    });
  }
}

export default function featuredColumns(block) {
  decorateBlockAnalytics(block);
  const rows = Array.from(block.children);
  rows.forEach((row) => {
    row.classList.add('featured-row');
    const featured = Array.from(row.children);
    featured.forEach((cell) => {
      const ps = cell.querySelectorAll('p');
      [...ps].forEach((p) => { if (p.childNodes.length === 0) p.remove() })
      cell.classList.add('featured-column');
      const a = cell.querySelector('a');
      if (a && cell.childNodes.length === 1 && (a.href.endsWith('.mp4'))) {
        lazyDecorateVideo(cell, a);
      } else if (cell.querySelector(':scope > .milo-video:first-child:last-child') 
              || cell.querySelector(':scope > p.button-container:first-child:last-child > .milo-video')
              || cell.querySelector(':scope > p.button-container:first-child:last-child > a[href*="youtu.be"]')
              || cell.querySelector(':scope > p.button-container:first-child:last-child > a[href*="youtube.com"]')) {
        cell.classList.add('picture-column');
      } else {
        const pic = cell.querySelector('picture:first-child:last-child');
        if (pic) {
          cell.classList.add('picture-column');
          const cta = row.querySelector('a.button.accent') ?? row.querySelector('a.button');
          const picParent = pic.parentElement;
          cell.innerHTML = '';
          if (picParent.tagName.toLowerCase() === 'a') {
            cell.appendChild(picParent);
            picParent.appendChild(pic);
          } else if (cta) {
            const a = createTag('a', {
              href: cta.href, title: cta.title, target: cta.target, rel: cta.rel,
            });
            cell.appendChild(a);
            a.appendChild(pic);
          } else {
            cell.appendChild(pic);
          }
        }
      }
    });
  });
}
