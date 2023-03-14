import { 
  createTag,
  decorateBlockAnalytics,
} from '../../scripts/utils.js';

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
      if (cell.querySelector('video, .milo-video, a[href*="youtu.be"], a[href*="youtube.com"], a[href*="tv.adobe.com"], a[href*=".mp4"]')) {
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
