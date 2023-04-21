/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {
  setLibs,
  unwrapSingularFragments,
  decorateButtons,
  turnH6intoDetailM,
  customSpacings,
  externalLinks,
  gnavUnderline,
  handleAnchors,
} from './utils.js';

const LIBS = 'https://milo.adobe.com/libs';
const STYLES = '/pages/styles/styles.css';
const CONFIG = {
  // imsClientId: 'college',
  contentRoot: '/pages',
  codeRoot: '/pages',
  stage: { edgeConfigId: '9a1395f3-a8e1-4287-8625-58c6bddb08f8' },
  prod: { edgeConfigId: 'da157e66-32ea-47df-bee3-55901c66e46f' },
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    br: { ietf: 'pt-BR', tk: 'inq1xob.css' },
    es: { ietf: 'es-ES', tk: 'oln4yqj.css' },
    jp: { ietf: 'ja-JP', tk: 'dvg6awq' },
  },
};

(async function loadLCPImage() {
  const lcpImg = document.querySelector('img');
  lcpImg?.setAttribute('loading', 'eager');
}());

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

const miloLibs = setLibs(LIBS);

(function loadStyles() {
  const paths = [`${miloLibs}/styles/styles.css`];
  if (STYLES) { paths.push(STYLES); }
  paths.forEach((path) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', path);
    document.head.appendChild(link);
  });
}());

const { loadArea, loadDelayed, setConfig } = await import(`${miloLibs}/utils/utils.js`);

(async function loadPage() {
  setConfig({ ...CONFIG, miloLibs });
  decorateButtons();
  turnH6intoDetailM();
  await loadArea();
  unwrapSingularFragments();
  externalLinks();
  customSpacings();
  gnavUnderline();
  handleAnchors();
  loadDelayed();
}());
