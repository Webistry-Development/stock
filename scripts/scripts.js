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

// This can be changed to 'https://milo.adobe.com/libs'
// if you don't have your /libs mapped to the milo origin.
const PROD_LIBS = 'https://milo.adobe.com/libs';

export const config = {
  // imsClientId: 'college',
  projectRoot: `${window.location.origin}`,
  locales: {
    '': { ietf: 'en-US', tk: 'hah7vzn.css' },
    de: { ietf: 'de-DE', tk: 'hah7vzn.css' },
    cn: { ietf: 'zh-CN', tk: 'puu3xkp' },
  },
};

/*
 * ------------------------------------------------------------
 * Edit below at your own risk
 * ------------------------------------------------------------
 */

function getMiloLibs() {
  const { hostname } = window.location;
  if (!hostname.includes('hlx.page')
    && !hostname.includes('hlx.live')
    && !hostname.includes('localhost')) return PROD_LIBS;
  const branch = new URLSearchParams(window.location.search).get('milolibs') || 'main';
  return branch === 'local' ? 'http://localhost:6456/libs' : `https://${branch}.milo.pink/libs`;
}
config.miloLibs = getMiloLibs();

(async function loadStyle() {
  const link = document.createElement('link');
  link.setAttribute('rel', 'stylesheet');
  link.setAttribute('href', `${config.miloLibs}/styles/styles.css`);
  document.head.appendChild(link);
}());

const {
  loadArea,
  loadDelayed,
  loadTemplate,
  setConfig,
} = await import(`${config.miloLibs}/utils/utils.js`);

(async function loadPage() {
  setConfig(config);
  await loadArea();
  const { default: loadModals } = await import(`${config.miloLibs}/blocks/modals/modals.js`);
  loadModals();
  loadDelayed();
}());
