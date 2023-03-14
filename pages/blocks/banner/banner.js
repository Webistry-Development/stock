import { decorateBlockAnalytics } from '../../scripts/utils.js';

export default function banner(block) {
  decorateBlockAnalytics(block);
  const pics = block.querySelectorAll('picture');
  pics.forEach((pic) => {
    if (pic.parentElement.tagName === 'P') {
      const parentDiv = pic.closest('div');
      const parentParagraph = pic.parentNode;
      parentDiv.insertBefore(pic, parentParagraph);
    }
  });
  const bg = block.querySelector(':scope > div:first-of-type');
  bg.classList.add('background');
  Array.from(bg.querySelectorAll('p')).forEach((p) => p.classList.remove('button-container'));
  Array.from(bg.querySelectorAll('a')).forEach((a) => a.classList.remove('button'));
  const bgImg = bg.querySelector('picture');
  if (!bgImg && bg.textContent.trim().startsWith('#')) {
    bg.style.background = bg.textContent;
    bg.innerHTML = '';
  } else if (bgImg && bgImg.parentElement.tagName.toLowerCase === 'p') {
    bgImg.parentElement.parentElement.appendChild(bgImg);
  }
  const content = block.querySelector(':scope > div:nth-of-type(2)');
  if (content) {
    content.classList.add('banner-content');
    const cells = Array.from(content.children);
    cells.forEach((cell) => {
      cell.classList.add('banner-column');
      const picElement = cell.querySelector('picture');
      if (picElement) {
        cell.classList.add('banner-image');
        content.classList.add('has-inline-image')
      }
      const emptyP = cell.querySelector(':scope > p:first-child:last-child');
      if (emptyP && emptyP.childNodes.length === 0) emptyP.remove();
    });
  } else {
    block.classList.add('empty-content');
  }
}
