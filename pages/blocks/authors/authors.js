import { 
  getMetadata, 
  createTag,
  getConfig,
  replaceKey,
  toSentenceCase
} from '../../scripts/utils.js';

export default async function authors(block) {
  const metaAuthors = getMetadata('authors');
  const heading = createTag('h3');
  const authors = createTag('p');
  const headingTitle = await replaceKey('authors', getConfig());
  heading.textContent = toSentenceCase(headingTitle);
  authors.textContent = metaAuthors;
  block.append(heading, authors);
}
