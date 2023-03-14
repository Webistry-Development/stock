import { decorateBlockAnalytics } from '../../scripts/utils.js';

export default function imageRows(block) {
  decorateBlockAnalytics(block);
  Array.from(block.children).forEach((div) => {
    if (!div.querySelector('img')) div.classList.add('image-rows-caption');
  });
}
