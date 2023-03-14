import {
  decorateBlockAnalytics,
  createTag,
  transformLinkToAnimation,
  makeRelative,
  turnH6intoDetailM,
  fetchPlaceholders,
} from '../../scripts/utils.js';

const placeholders = await fetchPlaceholders((result) => result);

function getFetchRange(payload) {
  let range;

  if (payload.offset + payload.limit < payload.cardsToBuild.length) {
    range = payload.offset + payload.limit;
  } else {
    range = payload.cardsToBuild.length;
  }

  return range;
}

export async function loadPageFeedCard(a) {
  const href = (typeof (a) === 'string') ? a : a.href;
  const path = makeRelative(href);
  if (!path.startsWith('/')) return null;
  const resp = await fetch(`${path}.plain.html`);
  if (!resp.ok) return null;
  const html = await resp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const pfCard = doc.querySelector('.page-feed-card > div');
  if (pfCard) {
    turnH6intoDetailM(pfCard);
    const aEl = (a && a.nodeType) ? a : createTag('a', { href: path });
    pfCard.append(createTag('div', {}, aEl));
    // eslint-disable-next-line consistent-return
    return pfCard;
  }
}

export async function loadPageFeedFromSpreadsheet(sheetUrl) {
  const path = makeRelative(sheetUrl);
  if (!path.startsWith('/')) return null;
  const resp = await fetch(path);
  if (!resp.ok) return;
  const json = await resp.json();
  const returnUrls = [];
  json.data.forEach((row) => {
    returnUrls.push({ link: row['page-url'], setting: row['setting'] });
  });
  return returnUrls;
}

function buildCard(card, overlay = false) {
  card.classList.add('pf-card');
  const cells = Array.from(card.children);
  let hasLink = false;
  cells.forEach((cell, index) => {
    if (index === 0) {
      const pic = cell.querySelector('picture:first-child:last-child');
      if (pic) {
        cell.classList.add('pf-card-picture');
      } else {
        const a = cell.querySelector('a');
        if (a && a.href.endsWith('.mp4')) {
          let video = null;
          video = transformLinkToAnimation(a);
          cell.innerHTML = '';
          if (video) {
            cell.appendChild(video);
            cell.classList.add('pf-card-picture');
          }
        } else {
          cell.classList.add('pf-card-text');
        }
      }
    } else if (index === 1) {
      cell.classList.add('pf-card-text');
    } else if (index === 2) {
      const cardLink = cell.querySelector('a');
      if (cardLink) {
        cell.classList.add('pf-card-link');
        hasLink = true;
      }
    } else if (index === 3 && card.querySelector('.pf-card-text')) {
      cell.classList.add('pf-card-banner');
      const cardTag = createTag('div');
      cardTag.innerHTML = cell.innerHTML;
      cell.innerHTML = '';
      cell.appendChild(cardTag);
    } else {
      cell.remove();
    }
  });
  if (hasLink) {
    const cardLink = card.querySelector('.pf-card-link a');
    if (cardLink) {
      cardLink.classList.remove('button');
      cardLink.classList.add('pf-card-container-link');
      cardLink.innerText = '';
      card.appendChild(cardLink);
      cells.forEach((div) => {
        cardLink.append(div);
      });
      card.querySelector('.pf-card-link').remove();
    }
  }
  if (overlay) {
    const div = document.createElement('div');
    div.classList.add('pf-card-overlay');
    card.appendChild(div);
  }
  return card;
}

function decorateLoadMoreButton(block) {
  const loadMoreWrapper = createTag('div', { class: 'content' });
  const loadMoreContainer = createTag('p', { class: 'button-container' });
  const loadMore = document.createElement('a');
  loadMore.className = 'button transparent';
  loadMore.href = '#';
  loadMore.textContent = placeholders['load-more'];
  loadMoreContainer.append(loadMore);
  loadMoreWrapper.append(loadMoreContainer);
  block.insertAdjacentElement('afterend', loadMoreWrapper);

  return {
    wrapper: loadMoreWrapper,
    button: loadMore,
  };
}

function getCols(total) {
  let len;
  if (total === 1 || total === 2) {
    len = 2;
  } else if (total % 3 === 0) {
    len = 3;
  } else if (total % 4 === 0) {
    len = 4;
  } else if (total % 5 === 0) {
    len = 5;
  } else if (total % 7 === 0) {
    len = 7;
  } else {
    len = 4;
  }

  return len;
}

function decorateCards(block, cards, payload) {
  if (payload.cardsToBuild.length < payload.limit) {
    payload.cols = getCols(payload.cardsToBuild.length);
    payload.limit = payload.cols % 2 ? 6 : 8;
  }

  if (payload.cardsToBuild.length === 5) {
    block.classList.add('col-3-pf-cards');
    const pfRowFive = createTag('div', { class: 'page-feed col-2-pf-cards' });
    pfRowFive.append(cards[3]);
    pfRowFive.append(cards[4]);
    payload.offset += 2;
    block.insertAdjacentElement('afterend', pfRowFive);
  } else if (payload.cardsToBuild.length === 7) {
    block.classList.add('col-3-pf-cards');
    const pfRowSeven = createTag('div', { class: 'page-feed col-4-pf-cards' });
    pfRowSeven.append(cards[3]);
    pfRowSeven.append(cards[4]);
    pfRowSeven.append(cards[5]);
    pfRowSeven.append(cards[6]);
    payload.offset += 4;
    block.insertAdjacentElement('afterend', pfRowSeven);
  } else {
    block.classList.add(`col-${payload.cols}-pf-cards`);
  }

  for (let i = 0; i < cards.length; i += 1) {
    if (![5, 7].includes(payload.cols) || ([5, 7].includes(payload.cols) && i < 3)) {
      block.append(cards[i]);
      payload.offset += 1;
    }
  }

  const newRange = getFetchRange(payload);

  if (payload.offset < payload.cardsToBuild.length) {
    const loadMoreObject = decorateLoadMoreButton(block);
    loadMoreObject.button.addEventListener('click', async (event) => {
      event.preventDefault();
      loadMoreObject.wrapper.remove();

      const newCards = [];

      for (let i = payload.offset; i < newRange; i += 1) {
        if (payload.loadFromJson) {
          if (payload.cardsToBuild[i].setting !== 'in_featured_pod') {
            const card = await loadPageFeedCard(payload.cardsToBuild[i].link);
            if (card) newCards.push(buildCard(card, payload.overlay));
          }
        } else if (payload.cardsToBuild[i] && payload.cardsToBuild[i].href) {
          const card = await loadPageFeedCard(payload.cardsToBuild[i]);
          if (card) newCards.push(buildCard(card, payload.overlay));
        } else {
          newCards.push(buildCard(payload.cardsToBuild[i], payload.overlay));
        }
      }

      decorateCards(block, newCards, payload);
    });
  }
}

export default async function pageFeed(block) {
  decorateBlockAnalytics(block);
  const payload = {
    offset: 0,
    limit: 8,
    cols: 4,
  };
  const undefinedCards = [];
  const rows = Array.from(block.children);
  payload.cardsToBuild = rows;
  const cards = [];
  const overlay = (block.classList.contains('overlay'));
  payload.overlay = overlay;
  if (block.classList.contains('fit')) {
    block.classList.add('pf-fit');
    block.classList.remove('fit');
  } else if (overlay) {
    block.classList.add('pf-overlay');
    block.classList.remove('overlay');
  }

  for (let n = 0; n < rows.length; n += 1) {
    const { children } = rows[n];
    if (children.length > 0 && children[0].querySelector('ul')) {
      const pageLinks = children[0].querySelector('ul').querySelectorAll('a');
      if (pageLinks[0] && pageLinks[0].href && pageLinks[0].href.endsWith('.json')) {
        payload.loadFromJson = true;
        const linksFromSpreadsheet = await loadPageFeedFromSpreadsheet(pageLinks[0].href);
        payload.cardsToBuild = linksFromSpreadsheet.filter((link) => link && link.setting !== 'in_featured_pod');
        if (payload.cardsToBuild && payload.cardsToBuild.length) {
          const range = getFetchRange(payload);
          for (let x = 0; x < range; x += 1) {
            const card = await loadPageFeedCard(payload.cardsToBuild[x].link);
            if (card) {
              cards.push(buildCard(card, overlay));
            } else {
              undefinedCards.push(x);
            }
          }
        }
      } else {
        payload.cardsToBuild = pageLinks;
        payload.loadFromJson = false;
        const range = getFetchRange(payload);
        for (let i = 0; i < range; i += 1) {
          if (pageLinks[i] && pageLinks[i].href) {
            const card = await loadPageFeedCard(pageLinks[i]);
            if (card) {
              cards.push(buildCard(card, overlay));
            } else {
              undefinedCards.push(i);
            }
          }
        }
      }
    } else {
      cards.push(buildCard(rows[n], overlay));
    }
  }

  undefinedCards.forEach((index) => {
    payload.cardsToBuild.splice(index, 1);
  });

  block.innerHTML = '';
  decorateCards(block, cards, payload);
  block.querySelectorAll('a.button').forEach((button) => {
    if (button.textContent === '') {
      button.classList.remove('button');
    }
  });
}
